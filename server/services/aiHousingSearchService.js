const { Op } = require("sequelize");
const { Housing, HousingImage } = require("../models");
const aiService = require("./aiService");

const normalizeDigits = (value) =>
  String(value || "").replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

const normalizeText = (value) =>
  normalizeDigits(value)
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");

const firstNumberAfter = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const number = Number(match[1]);
      if (Number.isFinite(number)) return number;
    }
  }

  return null;
};

const parseRoomType = (text) => {
  if (
    /غرفه\s*(وحده|واحده|لحالي|خاصه)/.test(text) ||
    /سنجل|single|one room|1 room/.test(text)
  ) {
    return "single";
  }

  if (/غرفتين|دبل|double|two rooms|2 rooms/.test(text)) return "double";
  if (/ثلاث|تربل|triple|three rooms|3 rooms/.test(text)) return "triple";

  return null;
};

const parseGender = (text) => {
  if (/بنات|طالبات|اناث|female|girls|women/.test(text)) return "female";
  if (/شباب|طلاب|ذكور|male|boys|men/.test(text)) return "male";
  return null;
};

const parseLocalFilters = (requestText) => {
  const text = normalizeText(requestText);

  const maxPrice = firstNumberAfter(text, [
    /(?:تحت|اقل من|اقل|لا يتجاوز|حد اقصي|لحد|لغايه|بحدود|max|under|below|less than|<=)\s*(?:ال)?\s*(\d+(?:\.\d+)?)/,
    /(\d+(?:\.\d+)?)\s*(?:او اقل|ولا اقل|or less|maximum|max)/,
  ]);

  const minPrice = firstNumberAfter(text, [
    /(?:فوق|اكثر من|اكثر|حد ادني|min|above|over|>=)\s*(?:ال)?\s*(\d+(?:\.\d+)?)/,
  ]);

  return {
    maxPrice,
    minPrice,
    room_type: parseRoomType(text),
    gender_allowed: parseGender(text),
    location: null,
    searchText: null,
    nearUniversity: /جامعه|university|campus/.test(text),
    summary: "Matched available housing using your request.",
  };
};

const numberOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const pickEnum = (value, allowed) => {
  if (typeof value !== "string") return null;
  const normalized = value.toLowerCase().trim();
  return allowed.includes(normalized) ? normalized : null;
};

const sanitizeAiFilters = (filters = {}) => ({
  maxPrice: numberOrNull(filters.maxPrice),
  minPrice: numberOrNull(filters.minPrice),
  room_type: pickEnum(filters.room_type, ["single", "double", "triple"]),
  gender_allowed: pickEnum(filters.gender_allowed, ["male", "female", "both"]),
  location:
    typeof filters.location === "string" && filters.location.trim()
      ? filters.location.trim().slice(0, 120)
      : null,
  searchText:
    typeof filters.searchText === "string" && filters.searchText.trim()
      ? filters.searchText.trim().slice(0, 120)
      : null,
  nearUniversity: Boolean(filters.nearUniversity),
  summary:
    typeof filters.summary === "string" && filters.summary.trim()
      ? filters.summary.trim().slice(0, 240)
      : "Matched available housing using your request.",
});

const mergeFilters = (localFilters, aiFilters) => ({
  ...localFilters,
  ...Object.fromEntries(
    Object.entries(aiFilters).filter(([, value]) => value !== null && value !== undefined && value !== "")
  ),
  nearUniversity: Boolean(localFilters.nearUniversity || aiFilters.nearUniversity),
});

const interpretHousingRequest = async (requestText) => {
  const localFilters = parseLocalFilters(requestText);

  try {
    const aiResult = await aiService.generateHousingFilters(requestText);
    return {
      filters: sanitizeAiFilters(mergeFilters(localFilters, sanitizeAiFilters(aiResult.filters))),
      source: aiResult.source,
      model: aiResult.model,
      warning: null,
    };
  } catch (error) {
    return {
      filters: sanitizeAiFilters(localFilters),
      source: "local",
      model: "rule-based parser",
      warning: "AI filter extraction was unavailable, so Dormify used local matching rules.",
    };
  }
};

const buildHousingWhere = (filters) => {
  const where = {
    status: "available",
    available_rooms: { [Op.gt]: 0 },
  };

  if (filters.maxPrice !== null || filters.minPrice !== null) {
    where.price = {};
    if (filters.maxPrice !== null) where.price[Op.lte] = filters.maxPrice;
    if (filters.minPrice !== null) where.price[Op.gte] = filters.minPrice;
  }

  if (filters.room_type) {
    where.room_type = filters.room_type;
  }

  if (filters.gender_allowed) {
    where.gender_allowed =
      filters.gender_allowed === "both" ? "both" : { [Op.in]: [filters.gender_allowed, "both"] };
  }

  const searchParts = [filters.location, filters.searchText].filter(Boolean);
  if (searchParts.length > 0) {
    const likeTerms = searchParts.map((part) => `%${part}%`);
    where[Op.or] = likeTerms.flatMap((term) => [
      { title: { [Op.like]: term } },
      { location: { [Op.like]: term } },
      { description: { [Op.like]: term } },
    ]);
  }

  return where;
};

const searchHousingWithAi = async (requestText) => {
  const interpretation = await interpretHousingRequest(requestText);
  const where = buildHousingWhere(interpretation.filters);

  const housings = await Housing.findAll({
    where,
    include: [{ model: HousingImage }],
    order: [
      ["price", "ASC"],
      ["createdAt", "DESC"],
    ],
    limit: 8,
  });

  return {
    request: requestText,
    summary: interpretation.filters.summary,
    filters: interpretation.filters,
    source: interpretation.source,
    model: interpretation.model,
    warning: interpretation.warning,
    resultsCount: housings.length,
    housings,
  };
};

module.exports = {
  parseLocalFilters,
  searchHousingWithAi,
};
