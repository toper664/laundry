steps:

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash\
--> close and reopen terminal\
nvm install node\
--> go to main project root\
npm install

<!-- create new env file with NODE_ENV in it (either 'production' or 'development') -->

--> create two new asymmetric key pair inside new "keys" folder on the root project folder (using OpenSSL prime256v1)\
privA.key for access tokens, privR.key for refresh tokens\

--> create env file in config folder with the needed info\

--> use node --import=tsx <entrypoint>.ts or npx tsx <entrypoint>.ts to run project\
