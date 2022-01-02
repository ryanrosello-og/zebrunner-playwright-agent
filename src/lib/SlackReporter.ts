import {WebClient, LogLevel} from '@slack/web-api';

export default class SlackReporter {
  private _slackClient: WebClient;
  private _channelIds: string[];
  private _enabled: boolean;

  constructor(config: {reporter: any[]}) {
    const zebRunnerConf = config.reporter.filter(
      (f) => f[0].includes('zeb') || f[1]?.includes('zeb')
    );
    this._enabled = zebRunnerConf[0][1].postToSlack;
    if (!this._enabled) {
      console.log('Slack reporter disabled - skipped posting results to Slack');
      return;
    }

    if (!process.env.SLACK_BOT_USER_OAUTH_TOKEN) {
      throw new Error('environment variable: SLACK_BOT_USER_OAUTH_TOKEN  was not supplied');
    }

    if (!zebRunnerConf[0][1].slackReportingChannels) {
      throw new Error(
        'No value was set for the "reportingChannels" configuration, this needs a comma separate values to instruct the bot which channel(s) to send the reports'
      );
    } else {
      this._channelIds = zebRunnerConf[0][1].slackReportingChannels.split(',');
    }

    this._slackClient = new WebClient(process.env.SLACK_BOT_USER_OAUTH_TOKEN, {
      logLevel: LogLevel.DEBUG,
    });
  }

  async sendMessage(message, zeburunnerRunLink: string) {
    if (!this._enabled) {
      console.log('Slack reporter disabled - skipped posting results to Slack');
      return;
    }

    for (const channelId of this._channelIds) {
      try {
        const result = await this._slackClient.chat.postMessage({
          channel: channelId,
          text: message,
          // blocks: [
          //   {
          //     type: 'divider',
          //   },
          //   {
          //     type: 'header',
          //     text: {
          //       type: 'plain_text',
          //       text: 'Test Results',
          //       emoji: true,
          //     },
          //   },
          //   {
          //     type: 'section',
          //     text: {
          //       type: 'mrkdwn',
          //       text: ':white_check_mark: *232*  *|*  :x: *5*  *|*  :fast_forward: *9*',
          //     },
          //   },
          //   {
          //     type: 'section',
          //     fields: [
          //       {
          //         type: 'mrkdwn',
          //         text: '*Duration:*\n12m',
          //       },
          //       {
          //         type: 'mrkdwn',
          //         text: '*Environment:*\nSTG',
          //       },
          //       {
          //         type: 'mrkdwn',
          //         text: '*BuildID:*\n435',
          //       },
          //     ],
          //   },
          //   {
          //     type: 'actions',
          //     elements: [
          //       {
          //         type: 'button',
          //         text: {
          //           type: 'plain_text',
          //           emoji: true,
          //           text: 'View in Zebrunner',
          //         },
          //         style: 'primary',
          //         value: 'click_me_123',
          //       },
          //     ],
          //   },
          // ],
        });
        console.log(result);
      } catch (error) {
        console.error(error);
      }
    }
  }

  public get isEnabled() {
    return this._enabled;
  }
}
