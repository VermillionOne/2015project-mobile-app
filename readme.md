## Mobile App (Appgyver)

- [Changelog](CHANGELOG.md)

***

### Upgrade steroids
```bash
npm remove steroids -g
npm install steroids -g
```
Note: "npm update steroids -g" gives me ERR messages on Mac.

***

### Setup this steroids project
```bash
mkdir ~/www
mkdir ~/www/shindiig
mkdir ~/www/shindiig/mobile-app-appgyver
cd ~/www/shindiig/mobile-app-appgyver/
git clone git@github.com:VermillionOne/2015project-mobile-app.git
cd repo
steroids update
steroids connect
```

***

### Using Sarafi Debugger With Steroids (Mac OS X)
* Open safari and go to settings ```Cmd ,``` -> Advanced Tab -> Check "Show Develop menu in menu bar"
* Close safari
* Go to (System Preferences > Security & Privacy > Privacy Tab > Accessibility Menu Item)  , check "iTerm" or "Terminal"
```bash
steroids connect
sim
sd
```
* The ```sd``` command will show available views to launch with Safari Debugger , for example: ```sd sign-in.html``` will launch inside the debugger
* Note: the ```sd``` command will only show views when the app has been fully loaded in simulator

***

### For Chrome Developer Tools Using AppGyver (Android Devices - Running Chrome on Mac OS X):

* Follow Instructions on the following site to setup your Android device:
<https://developer.chrome.com/devtools/docs/remote-debugging>

1. Startup ```steroids connect```
2. Wait for AppGyver to load in phone after scanning QR Code.
3. Enter ```cd``` into Steroids
4. When Chrome loads device inspection page, you will get a list of pages that you can view with Developer's tools.
5. Select the page that you'll be inspecting, and then navigate to it on your device.
6. You'll be able to view your tags just like you were debugging a web page, as well as edit the HTML and CSS.
7. For selecting a specific tag on your device, simply click the magnifying glass in the upper left corner of your inspector tools and then select what you want to inspect in your device.
8. To screencast into your browser, after you've navigated your device to your selected page, click the small device icon in the top right of your inspector tools. It also has a dropdown to toggle between landscape and portrait modes.

***

### Using GenyMotion Emulator and Chrome Developer Tools

* Follow the instructions here: http://docs.appgyver.com/tooling/cli/emulators/genymotion/
* Note: make sure both the App and CLI tools are copied to your Applications folder
* Note: make sure the emulator you have chosen ```Google Nexus 6``` is named as ```steroids``` in GenyMotion

```bash
steroids connect
g
chrome
```

* Now all views are available to chrome inspector, click on "inspect" link to launch chrome developer tools on that view

***

### Deploying this app to AppGyver Share (This creates a config/cloud.json file)
```bash
cd ~/www/steroids-app/mobile-app-appgyver/repo/
steroids login
steroids deploy
```
Note: config/cloud.json is unique to each steroids developer as this file is in .gitignore
Note: Currently devel branch (mojos config/cloud.json) is accessible through: http://suaray.com/app

***

### Running Unit Tests and Grunt tasks

* There are several Grunt tasks that can be ran to conduct angular unit tests and lint tests.
* Note: Make sure to do an `npm install` and `npm install -g grunt-cli` before trying to run any grunt tasks.  This will insure you have all the needed NPM modules for running the tests, including the Karma and Jasmine npm modules.

* To run just the lint test via jshint

1. Open bash terminal
2. Navigate to the mobile app gyver repo in your directory
3. Once all npm modules have been installed type

```bash

grunt linter

```

* To run just the angular js unit tests via Karma

1. Follow steps 1-3 above
2. Run the following command

```bash

grunt test

```

* To run both the linter and unit tests via jshint and Karma

1. Follow steps 1-3 above
2. Run the following command (the -v is for verbose mode and is optional)

```bash

grunt tester -v

```

Note: The Travis-CI build runs the "tester" grunt task with verbose option.  If you need to change what gets ran under Travis-CI the config is found in the .travis.yml file.

***
