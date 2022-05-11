# node-email-notification-example

- Express
- Nodemailer
- Sequelize with Heroku Postgres (PostgreSQL)
- reCAPTCHA v2

## Quick Start

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

After deploying your app to Heroku, navigate to Heroku Scheduler dashboard page: `https://dashboard.heroku.com/apps/%YOUR_HEROKU_APP_NAME%/scheduler?job=new`

Then, please add a Job as follows:

- Schedule: `Every 10 minutes`
- Run Command: `npm run cron`

Finally, navigate to `https://%YOUR_HEROKU_APP_NAME%.herokuapp.com/`
