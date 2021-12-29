import {test, expect} from '@playwright/test';
import {WebClient, LogLevel} from '@slack/web-api';

test.only('slocak @unit_test', async () => {
  const client = new WebClient('xoxb-nope', {
    logLevel: LogLevel.DEBUG,
  });

  const channelId = 'zeb';

  try {
    // Call the chat.postMessage method using the WebClient
    const result = await client.chat.postMessage({
      channel: channelId,
      blocks: [
        {
          "type": "divider"
        },
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "Test Results",
            "emoji": true
          }
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": ":white_check_mark: *232*  *|*  :x: *5*  *|*  :fast_forward: *9*"
          }
        },
        {
          "type": "section",
          "fields": [
            {
              "type": "mrkdwn",
              "text": "*Duration:*\n12m"
            },
            {
              "type": "mrkdwn",
              "text": "*Environment:*\nSTG"
            },
            {
              "type": "mrkdwn",
              "text": "*BuildID:*\n435"
            },
          ]
        },
        {
          "type": "actions",
          "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "View in Zebrunner"
              },
              "style": "primary",
              "value": "click_me_123"
            },
          ]
        }
      ]
    });

    console.log(result);
  } catch (error) {
    console.error(error);
  }
});
