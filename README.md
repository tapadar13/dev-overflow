## Dev Overflow 📝:

Dev Overflow is a powerful Developer Community Platform built with cutting-edge technologies to foster collaboration, knowledge sharing, and an engaging user experience. It is built with Next.js, MongoDB, TypeScript and TailwindCSS.

![Home](/public/assets/screenshots/home-dark.png)

## Screenshots 📷:

![Home](/public/assets/screenshots/home.png)
![Community](/public/assets/screenshots/community.png)
![Profile](/public/assets/screenshots/profile.png)
![Collections](/public/assets/screenshots/collections.png)
![Jobs](/public/assets/screenshots/jobs.png)
![Tags](/public/assets/screenshots/tags.png)
![Question Details](/public/assets/screenshots/question-details.png)

## Tech Stack 📚:

- `Next.js` 14.1.0 and `React.js` 18
- `TypeScript` 5
- `TailwindCSS` 3.3.0 and its plugins
- `MongoDB` 6.3.0 and `Mongoose` 8.1.1
- `Clerk` 4.29.5
- `React Hook Form` 7.49.3 and `Radix UI`
- `Zod` 3.22.4
- `Prismjs` 1.29.0
- `Query String` 8.2.0
- `cslx`, `class-variance-authority`, `tw-merge` and `tailwindcss-animate`
- `EsLint`, `Prettier`, and their ecosystem.
- [Vercel](https://vercel.com/)

## Features 🎉:

- **Authentication**

  - [x] Secure authentication using Clerk, offering email/password options and seamless social login integration with Google and GitHub.

- **Question and Answer System**

  - [x] Users can post questions with support for markdown code rendering, complete code blocks, and tagging functionality.
  - [x] A comprehensive answering system with a complete markdown editor and code block support.
  - [x] Users can upvote/downvote questions and answers, promoting community-driven engagement.

- **Global Search System**

  - [x] A debounced, server-side rendered global search system.
  - [x] Users can efficiently search for questions, answers, tags and other users, with automatic suggestions for top matches, enhancing navigation efficiency.

- **Community Features**

  - [x] Explore the community tab to discover and connect with other platform users.
  - [x] A `Collections` tab that allows users to access and manage their saved questions efficiently.
  - [x] A `Tags` section that enables users to search for questions related to specific tags.

- **Profile Management**

  - [x] A `Profile` tab where users can view information about themselves, including top questions and answers posted.
  - [x] Users have the ability to seamlessly update their profile information.

- **User Interface**

  - [x] A responsive design, ensuring optimal user experience across various devices.
  - [x] Users can switch between light, dark, and system mode.

- **Job Page**

  - [x] A `Jobs` tab users can see job openings in their respective locations.
  - [x] Users can search for jobs by selecting a specific country from the filter for which they want to see job openings.

- **Smart Filtering System**

  - [x] All pages have a filter system to sort questions/tags/answers/users etc. based on highest upvotes/newest/frequent/top contributors, etc.
  - [x] Questions can be sorted based on a comprehensive “Recommendation” system where a user can get posts of the tags they have been interacting with, except their own questions.

- **Pagination**

  - [x] User-friendly pagination at the bottom of every single page.

- **Reputation and Badge System**

  - [x] Users earn reputation points based on platform activities (posting questions and answers, upvoting questions/answers etc).
  - [x] Badges are displayed on user profiles as a testament to engagement.

- **User Analytics for Optimization**

  - [x] Efficiently processed user data, calculated metrics, and optimized performance using MongoDB's aggregation pipeline by leveraging powerful stages like `$match`, `$group`, and `$project`.

- **Form Handling and Validation**

  - [x] Utilized React Hook Form for all forms across the application, ensuring a smooth and efficient user input experience.
  - [x] Implemented validation using Zod for enhanced data integrity.

- **Type Safety and Tooling**
  - [x] A consistent and visually appealing user interface throughout the application
  - [x] A robust codebase, enhancing type safety and ensuring code robustness and maintainability

## Scripts 📜:

- `dev`: Start development server
- `build`: Build for production
- `start`: Start production server
- `lint`: Lint code

## Inspiration 🎨:

Inspired by [Stack Overflow](https://stackoverflow.com/)'s design.

## Contributing 🤝:

Contributions are welcome! If you find any bugs or have suggestions for improvements, please open an issue or submit a pull request on the GitHub repository.
To contribute to this project, please follow these steps:

- Fork the repository.
- Create a new branch for your feature or bug fix.
- Make your changes and commit them.
- Push your changes to your fork.
- Submit a pull request.

If you have read all of this, please star the repo, it will help me a lot ❤️
