const userEventEmitter = require('./userEvents');
const { sendWelcomeEmail } = require('../utils/emailService');

function registerListeners() {
    userEventEmitter.on('user:created', async (user) => {
        try {
            console.log(`New user registered: ${user.name} (${user.email})`);
            await sendWelcomeEmail(user);
            console.log(`Welcome email sent to ${user.email}`);
        } catch (error) {
            console.error('Error handling user registration event:', error);
        }
    });

    userEventEmitter.on('booking:created', async (booking) => {
        try {
            console.log(`New booking created: ${booking.id} by user ${booking.user_id}`);
        } catch (error) {
            console.error('Error handling booking created event:', error);
        }
    });

    userEventEmitter.on('booking:status_updated', async ({ booking, status }) => {
        try {
            console.log(`Booking ${booking.id} status updated to ${status}`);
        } catch (error) {
            console.error('Error handling booking status updated event:', error);
        }
    });

    userEventEmitter.on('booking:deleted', async ({ bookingId, userId }) => {
        try {
            console.log(`Booking ${bookingId} deleted by user ${userId}`);
        } catch (error) {
            console.error('Error handling booking deleted event:', error);
        }
    });

    userEventEmitter.on('housing:created', async (housing) => {
        try {
            console.log(`New housing created: ${housing.id} at ${housing.location}`);
        } catch (error) {
            console.error('Error handling housing created event:', error);
        }
    });
}

module.exports = {
    registerListeners,
};