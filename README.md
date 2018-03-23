Star Tribune - Hennepin County Most Wanted Scraper
================

by [Frey Hargarten](https://github.com/jeffhargarten)

The Google Sheet and associated Google Script can automatically or manually pull and archive snapshots of the most recent [Hennepin County most wanted list](http://www.hennepinsheriff.org/jail-warrants/most-wanted/list).

Use the following steps to set it up:

1. Import the most_wanted.xlsx to Google Sheets

2. In Google Sheets, click Tools > Script editor...

3. Copy and paste the contents of scraper.js into the Script Editor

4. Name, save and grant access to the script

5. To run it automatically, setup a trigger in the Google script for the chronTasks() function and set the interval

6. All list scrapes will be stored and timestamped in their own tabs