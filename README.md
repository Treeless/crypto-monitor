# ARE YOU BOYS READY FOR THIS?!

## Technologies we need to install

1. NodeJS 8.4+
2. MongoDB (install this as a service)

## How to get the application running

1. `npm install`
2. `gulp`
3. Now, navigate to localhost:80 in your browser.

## TODO LIST
1. work together on getting posts from a coins subreddit, and evaluating and ranking the post based on engagement
2. a news article listing system based on a coin. So finding articles on reddit and saving their links
3. coin prices charted from that api NAKUL found

## WEEKLIES:

Talking with OMAR - <strong>2017-11-03</strong>
* <em>Issue</em>: No subreddit traffic api, has been deprecated
* <strong>Recommended Solution</strong>: Create a library for subreddit post engagement evaluation. (we can also mine news articles during this process)
* RESEARCH: Papers -> Engagement - HISTORY
* How do they mine? Posts for engagement. Formula? Weights ;)
* Information Retrieval Papers
* Japan, wikipedia, scraping. Rank based on importance. What can we pull from these examples?
* <strong>OUTCOME</strong>: We need to create a library that will pull in reddit posts from a specific subreddit and rank each post based on upvotes, comments, golded comments, and all out engagement. Then using the ranking system, graph the weights alongside the price of the coin.