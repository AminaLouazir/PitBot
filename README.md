# PitBot 🏎️
This is a Next.js project bootstrapped with create-next-app.

Getting Started
1. Clone the Repository
Clone this repository to your local machine:

bash
Copy
Edit
git clone https://github.com/yourusername/project-name.git
2. Set Up Environment Variables
After cloning the repository, create a .env file in the root directory of the project and add the following environment variables:

ini
Copy
Edit
ASTRA_DB_API_KEY=your_datastax_api_key
OPENAI_API_KEY=your_openai_api_key
Make sure to replace your_datastax_api_key and your_openai_api_key with the actual keys.

3. Install Dependencies
Run the following command to install all the required dependencies. It is crucial to have the same versions listed in the package.json file.

bash
Copy
Edit
npm install
# or
yarn install
# or
pnpm install
4. Seed the Database
After installing the dependencies, run the following command to seed the database with the necessary data:

bash
Copy
Edit
npm run seed
5. Run the Development Server
Now that your environment is set up, start the development server:

bash
Copy
Edit
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
Open http://localhost:3000 with your browser to see the result.
