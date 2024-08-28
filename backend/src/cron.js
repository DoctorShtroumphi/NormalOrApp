const cron = require('node-cron');
const Question = require('./models/Question');
const moment = require('moment-timezone'); // Install moment-timezone for easy timezone handling

// Function to schedule the cron job to run at 10am BST every day
function scheduleDailyQuestionSelection() {
    cron.schedule('0 10 * * *', async () => {
        try {
            const today = moment().tz('Europe/London').startOf('day').toDate();
            const existingQuestion = await Question.findOne({ dateAsked: today });

            if (!existingQuestion) {
                // No question has been asked today, pick a random one that hasn't been asked yet
                const randomQuestion = await Question.findOne({ dateAsked: null });

                if (randomQuestion) {
                    randomQuestion.dateAsked = today;
                    await randomQuestion.save();
                    console.log(`Today's question selected: ${randomQuestion.questionText}`);
                } else {
                    console.log('No more questions available to ask.');
                }
            } else {
                console.log('A question has already been selected for today.');
            }
        } catch (err) {
            console.error('Failed to select today\'s question:', err);
        }
    }, {
        timezone: "Europe/London"
    });
}

module.exports = scheduleDailyQuestionSelection;