import requests
import json
import time
from nltk.sentiment.vader import SentimentIntensityAnalyzer as SIA

# Set your header according to the form below
# <platform>:<app ID>:<version string> (by /u/<reddit username>)

# Add your username below
hdr = {'User-Agent': 'windows:r/bitcoin.single.result:v1.0' +
       '(by /u/RedditSentiment)'}
url = 'https://www.reddit.com/r/bitcoin/.json'
req = requests.get(url, headers=hdr)
json_data = json.loads(req.text)
p = 0
n = 0
o = 0

posts = json.dumps(json_data['data']['children'], indent=4, sort_keys=True)

data_all = json_data['data']['children']
num_of_posts = 0
while len(data_all) <= 100:
    time.sleep(2)
    last = data_all[-1]['data']['name']
    url = 'https://www.reddit.com/r/bitcoin/.json?after=' + str(last)
    req = requests.get(url, headers=hdr)
    data = json.loads(req.text)
    data_all += data['data']['children']
    if num_of_posts == len(data_all):
        break
    else:
        num_of_posts = len(data_all)

sia = SIA() 
pos_list = []
neg_list = []
neu_list = []

for post in data_all:
    res = sia.polarity_scores(post['data']['title'])

    if res['compound'] > 0.2:
    	#pos_list.append(res)
    	pos_list.append(post['data']['title'])
    	#pos_list.append(' ')
    	p += 1
        #pos_list.append(post)

    elif res['compound'] < -0.2:
    	#neg_list.append(res)
    	neg_list.append(post['data']['title'])
    	#neg_list.append(' ')
    	n += 1
        #neg_list.append(post)

    elif res['compound'] > -0.2 and res['compound'] < 0.2:
	   	#neu_list.append(res)
	   	neu_list.append(post['data']['title'])
	   	#neu_list.append(' ')
	   	o += 1


print("Positive Posts:")	
for post in pos_list:
	print(post)

print("\nNeutral Posts:\n")
for post in neu_list:
	print(post)

print("\nNegative Posts:\n")
for post in neg_list:
	print(post)

print("Positive to Negative Ratio:")
t = p/n
format(t, '.2f')
print(t)
print("\n% Positive: " + str(p) + "\n% Neutral : " + str(o) + "\n% Negative : " + str(n))
print("")

with open("pos_news_titles.txt", "w", encoding='utf-8',
          errors='ignore') as f_pos:
    for post in pos_list:
        f_pos.write(str(post) + "\n")

with open("neg_news_titles.txt", "w", encoding='utf-8', errors='ignore') as p_pos:
	for post in neg_list:
		p_pos.write(str(post) + "\n")

with open("neu_news_titles.txt", "w", encoding='utf-8', errors='ignore') as o_pos:
	for post in neu_list:
		o_pos.write(str(post) + "\n")
