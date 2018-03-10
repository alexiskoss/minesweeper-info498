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

Click the **Install App to Workspace** button and click **Authorize** on the proceeding page. Now you have successfully created the basic app support our code requires to run on Slack.

Please proceed to the main page of your Slack Workspace. In the side bar where your channels and direct messages are located, you should see a new heading called **Apps** and beneath it a new DM with a bot called **Minesweeper**. 

![slack sidebar](/img/8.png?raw=true)

This is where your main interaction with our bot will take place. 
