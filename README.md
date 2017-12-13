# DiscordCoinmarketcap

git clone https://github.com/gordon1210/DiscordCoinmarketcap.git

cd DiscordCoinmarketcap

npm install

create app
https://discordapp.com/developers/applications/me

create bot user for your newly created app to get the token
(see https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token for details and screenshots)

auth app (change %% to the client_id given to your app)
https://discordapp.com/oauth2/authorize?scope=bot&permissions=0&client_id=%%

cp config.example.json config.json

change token value

node index.js


in discord:
!cmc bitcoin
