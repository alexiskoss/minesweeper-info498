# Slack Minesweeper App

Created by Lisa Koss & Alexis Koss for INFO 498.

This Slack application is our variation of the traditional game Minesweeper. 

## Installation Instructions

To install this on your own development Slack Workspace, you must first [create a new Slack application](https://api.slack.com/apps?new_app=1). Give the app the name **Minesweeper** and install it on any development Slack Workspace.

![create Slack App](/img/1.png?raw=true)

Next, you will be brought to the following page. Please click on the **Bots** tile card. 

![click on bots](/img/2.png?raw=true)

Click **Add Bot** and give your new bot the display name of **Minesweeper** and the username of **minesweeper**. 

![create bot](/img/3.png?raw=true)

After successfully adding a bot, click on the **Basic Information** tab in the side column bar to get back to the page you were at before. Next, click on the **Add Features and Functonality** drop down and click on **Interactive Components**.

![click on interactive components](/img/4.png?raw=true)

Click the enable interactive components button on the new page and this is where we must go and generate a ngrok URL that makes an "instant, secure URL to your localhost server through any NAT or firewall." This is the URL that will be placed in the **request URL** text field. 

We've included the ngrok executable in our repo, so simply open a new terminal window and **cd** into the "minesweeper-info498" folder on your system and run the following command "**./ngrok http 3000**". Please use port 3000, as our application relies on this port. You should now see a similar screen to the following:

![ngrok terminal](/img/5.png?raw=true)

**IMPORTANT** ngrok URLs are **RANDOMLY** generated. Your generated URL will **not** match the screenshot. Please copy and paste the https URL (something like https://8f80336e.ngrok.io) into the **request URL** text field of the **Interactive Components** Slack page you navigated to earlier. Add **/slack/actions** after the URL you just pasted in. Your **Interactive Components** page should look like this after submitting it.

![interactive components page](/img/6.png?raw=true)

Once again, click on the **Basic Information** tab in the side bar to navigate back to the main application page. Click on the **Install your app to your workspace** drop down menu.

![install app](/img/7.png?raw=true)

Click the **Install App to Workspace** button and click **Authorize** on the proceeding page. Now please click on **OAuth & Permissions** in the side bar of your app settings. On this page, you will see something like the following, you need to copy the **Bot User OAuth Access Token**, which begins with **xoxb**.

![bot token](/img/9.png?raw=true)

Before you can interact with our Minesweeper bot on your Workspace, you must first edit the **index.ts** file we provided in the **src** folder of **minesweeper-info498**. Open this file and replace the **TOKEN** in **const bot_token** with the bot token you just copied. Make sure it is surrounded by single parentheses (').

Next, click on the **Basic Information** tab in the side bar of your app settings. Scroll down until you see the **App Credentials** settings and copy the **verification token** here. 

![verification token](/img/10.png?raw=true)

Replace the **TOKEN** in **const slackMessages** with the verification token you just copied. Make sure it is surrounded by single parentheses (').

Open a new terminal window and **cd** into the **minesweeper-info498** directory if you're haven't already. Run the command: **tsc** to compile the typescript file you just edited and then run the command: **node build/index.js**. Now that you have both the node file and ngrok server running, you are ready to go!

Now you have successfully created the basic app support our code requires to run on Slack.

## How To Instructions

Please proceed to the main page of your Slack Workspace. In the side bar where your channels and direct messages are located, you should see a new heading called **Apps** and beneath it a new DM with a bot called **Minesweeper**. 

![slack sidebar](/img/8.png?raw=true)

This is where your main interaction with our bot will take place. @ mention the bot by saying **@Minesweeper start game** and the bot will prompt you to play a game of Minesweeper as shown below.

![minesweeper game](/img/11.png?raw=true)

Keep following the on screen instructions and you'll be playing a traditional game of Minesweeper! 

**Emoji guide**:

⬛️ = square has **not** been uncovered

⬜️ = square has been uncovered

1️⃣ = all number tiles indicate how many bombs are in the 8 squares surrounding the square unrevealed

🚩 = user has voluntarily flagged the square as a potential bomb

💥 = user did not flag this bomb, exploded

💣 = user flagged this bomb correctly, didn't explode

