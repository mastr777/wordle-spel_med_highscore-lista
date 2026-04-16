
1 Klona projektet

git clone <repo-url>
cd <repo-namn>


2 Frontend (React)

cd wordle-game
npm install
npm run build


3 Backend (server)

cd ../server
npm install

Skapa en .env-fil i /server och lägg in:
MONGODB_URI=<connection string>

(Av säkerhetsskäl skickas anslutningssträngen för 
MongoDB separat och finns därför inte med i projektet).


4 Starta servern

npm start


5 Öppna i webbläsaren

http://localhost:5080



