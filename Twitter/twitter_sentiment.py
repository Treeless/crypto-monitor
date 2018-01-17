""" Twitter Sentiment Analyzer

Authors: Michael Dragan; Eliot Boyd

This module sifts through the tweets and retweets of a specified twitter page,
compartmentalize the tweets based off their sentiment, and stores their content
in three .txt files (neg_tweets, pos_tweets, and neu_tweets).

Use python 3.6 + to execute

Required Libraries:
- re
- tweepy
- from tweepy import OAuthHandler
- nltk

IMPORTANT: On your python interpreter, please input the following:
import nltk nltk.download()
    - install all the packages within the window that pops up.

Updates:
- Stores tweeets from @Bitcoin, @Ripple, @ethereumproject, bgarlinghouse
and twitter feed containing bitcoin keyword
- get_ratio_count returns ratio double to use for ranking algorithm

TODO:
- Should we remove retweets? Who should we 
follow?

- Graphs numpy/matplotlab

- For some reason, arbitrary numbers (ex. 1, 5) appear as tweets or retweets
within the neutral list. Find out why and how to remove these from the list.

- Improve code documentation for better readability

- Method to save tweets in .txt format

- Update method to run once we get an actual server running
    - Consider frequency of which to update .txt files.
"""
import re
import tweepy
from tweepy import OAuthHandler
from nltk.sentiment.vader import SentimentIntensityAnalyzer as SIA

class TwitterClient(object):
    """Class that uses the twitter API"""

    def __init__(self):
        """Keys and tokens from twitter dev console"""
        consumer_key = '9DTwWsyG7fW8kOwjAeVAcewTn'
        consumer_secret = 'wYe6CC9IFSYWpD3Aw7VOPUQTKcBRBXLlzkynQZIPNO0N2WObXq'
        access_token = '140572718-iEofi8MBOS8akd4iqf1LpBX1xbo4SPHXxqgKhOC3'
        access_token_secret = 'xDTkuECXVK7iMj5slevgqrV1Pqj2vXTpqormkFeqvvjAK'

        try: # Authentication attempt
            self.auth = OAuthHandler(consumer_key, consumer_secret) # Creates OAuthHandler object
            self.auth.set_access_token(access_token, access_token_secret) # Sets access
            self.api = tweepy.API(self.auth) #tweepy api object that fetches tweets
        except:
            print("Error: Authentification Failed") #TODO exception type

    def clean_tweet(self, tweet):
        """method clean_tweet removes links, special chars from tweets"""
        return ' '.join(re.sub("(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)", " ", tweet).split())
    
    def get_tweet_sentiment(self, tweet):
        """ Returns value (double) of sentiment of each tweet """
        sia = SIA()
        result = sia.polarity_scores(self.clean_tweet(tweet))

        return result['compound']

    def get_tweets_user(self, id):
        """ Returns list of most recent tweets andfrom a Twitter account.
        
        Uses get_tweet_sentiment in order to store tweet sentiment.
        """
        tweets = [] #  list that stores twitter statuses
        
        try:
            fetched_tweets = self.api.user_timeline(id = id, include_rts = 'false', count = 3200) # fetches tweet from USER
            
            for tweet in fetched_tweets:
                parsed_tweet = {}  # Dictionary stores tweet's text and sent
                parsed_tweet['text'] = self.clean_tweet(tweet.text)
                parsed_tweet['sentiment'] = self.get_tweet_sentiment(tweet.text)

                if tweet.retweet_count > 0:  # Add retweets not in tweets dic
                    if parsed_tweet not in tweets:  
                        tweets.append(parsed_tweet) 
                else:
                    tweets.append(parsed_tweet)
            
            return tweets
        
        except tweepy.TweepError as e:
            print("Error : " + str(e))
    
    def get_tweet_feed(self, query, count):

        tweets = []

        try:
            fetched_tweets = self.api.search(q = query, count = count)
            
            for tweet in fetched_tweets:
                parsed_tweet = {}  # Dictionary stores tweet's text and sent
                parsed_tweet['text'] = self.clean_tweet(tweet.text)
                parsed_tweet['sentiment'] = self.get_tweet_sentiment(tweet.text)

                if tweet.retweet_count > 0:  # Add retweets not in tweets dic
                    if parsed_tweet not in tweets:  
                        tweets.append(parsed_tweet) 
                else:
                    tweets.append(parsed_tweet)
            
            return tweets
        
        except tweepy.TweepError as e:
            print("Error : " + str(e))

    def get_ratio_counts(self, tweets):
        pos_lis, neg_lis, neu_lis = [], [], []
        pos_count, neg_count, neu_count, total_count = 0, 0, 0, 0
       
        for tweet in tweets: # For loops categorizes tweets based off of sentiment.
            if tweet['sentiment'] > 0.4:
                pos_lis.append(tweet)
                pos_count += 1
                total_count += 1
            elif tweet['sentiment'] < -0.4:
                neg_lis.append(tweet)
                neg_count += 1
                total_count += 1
            else:
                neu_lis.append(tweet)
                neu_count += 1
                total_count += 1

        print("Total number of tweets and retweets:"  + str(total_count))
        print("\033[0;32;47mNumber of positive tweets and retweets: " + str(pos_count))
        print("\033[1;33;40mNumber of neutral tweets and retweets: " + str(neu_count))
        print("\033[0;31;47mNumber of negative tweets and retweets: " + str(neg_count))

        if neg_count != 0:
            ratio = pos_count / neg_count
            print("\033[0;34;47mPositive to negative ratio: " + str(format(ratio, '.2f')) + "\n")
            return ratio # ratio to be used for ranking algorithm
        else:
            return 1
        
def main():
    """
    Instantiates twitter client, retrieves tweets, categorizes tweets into 
    positive, neutral, or negative lists. Optional to print tweets from each 
    list. Lastly, saves the tweets in .txt files. 
    output bench"""
    api = TwitterClient() # creating object of TwitterClient Class
    bitcoint_tweets = api.get_tweets_user('Bitcoin') # fetches tweets from @Bitcoin
    ripple_tweets = api.get_tweets_user('Ripple') # fetches tweets from @Ripple
    eth_tweets = api.get_tweets_user('ethereumproject') #fetches tweets from ethereum
    influential_person = api.get_tweets_user('bgarlinghouse') #fetches tweets from @bgarlinghouse
    twitter_feed = api.get_tweet_feed('Bitcoin', 100)

    api.get_ratio_counts(bitcoint_tweets)
    api.get_ratio_counts(ripple_tweets)
    api.get_ratio_counts(eth_tweets)
    api.get_ratio_counts(influential_person)
    api.get_ratio_counts(twitter_feed)
    
if __name__ == "__main__":
    # calling main function
    main()