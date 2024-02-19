"use server";

import User from "@/database/user.model";
import Tag from "@/database/tag.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import { FilterQuery } from "mongoose";
import Answer from "@/database/answer.model";
import { BadgeCriteriaType } from "@/types";
import { assignBadges } from "../utils";
import Interaction from "@/database/interaction.model";

export async function createUser(userData: CreateUserParams) {
  try {
    await connectToDatabase();

    const newUser = await User.create(userData);
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    await connectToDatabase();

    const { searchQuery, filter, page = 1, pageSize = 10 } = params;

    // Calculate the number of posts to skip based on the page number and page size.
    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof User> = {};

    if (searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, "i") } },
        { username: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    let sortOptions = {};

    switch (filter) {
      case "new_users":
        sortOptions = { joinedAt: -1 };
        break;

      case "old_users":
        sortOptions = { joinedAt: 1 };
        break;

      case "top_contributors":
        sortOptions = { reputation: -1 };
        break;

      default:
        break;
    }

    const users = await User.find(query)
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    const totalUsers = await User.countDocuments(query);
    const isNext = totalUsers > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getUserById(params: any) {
  try {
    await connectToDatabase();

    const { userId } = params;
    const user = await User.findOne({ clerkId: userId });
    return user;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    await connectToDatabase();

    const { clerkId, updateData, path } = params;

    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });

    revalidatePath(path);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    await connectToDatabase();

    const { clerkId } = params;

    // Find the user by clerkId
    const user = await User.findOne({ clerkId });

    if (!user) {
      throw new Error("User not found.");
    }

    // get user question ids
    // eslint-disable-next-line no-unused-vars
    const userQuestionIds = await Question.find({ author: user._id }).distinct(
      "_id"
    );

    // Delete all questions asked by the user
    await Question.deleteMany({ author: user._id });

    // TODO: Delete all user answers, comments etc.
    await Answer.deleteMany({ author: user._id });

    // Delete the answers created by other users on questions created by the user
    await Answer.deleteMany({ question: { $in: userQuestionIds } });

    // Remove user reference from upvotes and downvotes on questions
    await Question.updateMany(
      { upvotes: user._id },
      { $pull: { upvotes: user._id } }
    );

    await Question.updateMany(
      { downvotes: user._id },
      { $pull: { downvotes: user._id } }
    );

    // Remove user reference from upvotes and downvotes on answers
    await Answer.updateMany(
      { upvotes: user._id },
      { $pull: { upvotes: user._id } }
    );

    await Answer.updateMany(
      { downvotes: user._id },
      { $pull: { downvotes: user._id } }
    );

    // Delete interactions involving the user
    await Interaction.deleteMany({ user: user._id });

    // Update tags to remove references to the user's questions
    await Tag.updateMany(
      { questions: { $in: userQuestionIds } },
      { $pull: { questions: { $in: userQuestionIds } } }
    );

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(user._id);

    return deletedUser;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    await connectToDatabase();

    const { userId, questionId, path } = params;

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const isQuestionSaved = user.saved.includes(questionId);

    if (isQuestionSaved) {
      // Remove the question from the saved list
      await User.findByIdAndUpdate(
        userId,
        { $pull: { saved: questionId } },
        { new: true }
      );
    } else {
      // Add the question to the saved list
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { saved: questionId } },
        { new: true }
      );
    }

    revalidatePath(path);
  } catch (error) {
    console.error("Error toggling saved question:", error);
    throw error;
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    await connectToDatabase();

    const { clerkId, searchQuery, filter, page = 1, pageSize = 20 } = params;

    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, "i") } }
      : {};

    let sortOptions = {};

    switch (filter) {
      case "most_recent":
        sortOptions = { createdAt: -1 };
        break;

      case "oldest":
        sortOptions = { createdAt: 1 };
        break;

      case "most_voted":
        sortOptions = { upvotes: -1 };
        break;

      case "most_viewed":
        sortOptions = { views: -1 };
        break;

      case "most_answered":
        sortOptions = { answers: -1 };
        break;

      default:
        break;
    }

    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        sort: sortOptions,
        skip: skipAmount,
        limit: pageSize + 1,
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });

    const isNext = user.saved.length > pageSize;

    if (!user) {
      throw new Error("User not found");
    }

    // Extract the saved questions from the user
    const savedQuestions = user.saved.slice(0, pageSize);

    return { questions: savedQuestions, isNext };
  } catch (error) {
    console.error("Error fetching saved questions:", error);
    throw error;
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    await connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      throw new Error("User not found");
    }

    const totalQuestions = await Question.countDocuments({ author: user._id });
    const totalAnswers = await Answer.countDocuments({ author: user._id });

    const [questionUpvotes] = await Question.aggregate([
      {
        $match: { author: user._id },
      },
      {
        $project: {
          _id: 0,
          upvotes: { $size: "$upvotes" },
        },
      },
      {
        $group: {
          _id: null,
          totalUpvotes: { $sum: "$upvotes" },
        },
      },
    ]);

    const [answerUpvotes] = await Answer.aggregate([
      {
        $match: { author: user._id },
      },
      {
        $project: {
          _id: 0,
          upvotes: { $size: "$upvotes" },
        },
      },
      {
        $group: {
          _id: null,
          totalUpvotes: { $sum: "$upvotes" },
        },
      },
    ]);

    const [questionViews] = await Question.aggregate([
      {
        $match: { author: user._id },
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
        },
      },
    ]);

    const criteria = [
      {
        type: "QUESTION_COUNT" as BadgeCriteriaType,
        count: totalQuestions,
      },
      {
        type: "ANSWER_COUNT" as BadgeCriteriaType,
        count: totalAnswers,
      },
      {
        type: "QUESTION_UPVOTES" as BadgeCriteriaType,
        count: questionUpvotes?.totalUpvotes || 0,
      },
      {
        type: "ANSWER_UPVOTES" as BadgeCriteriaType,
        count: answerUpvotes?.totalUpvotes || 0,
      },
      {
        type: "TOTAL_VIEWS" as BadgeCriteriaType,
        count: questionViews?.totalViews || 0,
      },
    ];

    const badgeCounts = assignBadges({ criteria });

    return {
      user,
      totalQuestions,
      totalAnswers,
      badgeCounts,
      reputation: user.reputation,
    };
  } catch (error) {
    console.error("Error getting user info:", error);
    throw error;
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    await connectToDatabase();
    const { userId, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize;

    const totalQuestions = await Question.countDocuments({ author: userId });

    const userQuestions = await Question.find({ author: userId })
      .sort({ createdAt: -1, views: -1, upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate("tags", "_id name")
      .populate("author", "_id clerkId name picture");

    const isNextQuestions = totalQuestions > skipAmount + userQuestions.length;

    return { totalQuestions, questions: userQuestions, isNextQuestions };
  } catch (error) {
    console.error("Error fetching user questions:", error);
    throw error;
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    await connectToDatabase();
    const { userId, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize;

    const totalAnswers = await Answer.countDocuments({ author: userId });

    const userAnswers = await Answer.find({ author: userId })
      .sort({ upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({
        path: "question",
        select: "_id title",
      })
      .populate("author", "_id clerkId name picture");

    const isNextAnswers = totalAnswers > skipAmount + userAnswers.length;

    return { totalAnswers, answers: userAnswers, isNextAnswers };
  } catch (error) {
    console.error("Error fetching user answers:", error);
    throw error;
  }
}
