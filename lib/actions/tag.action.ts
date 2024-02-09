"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from "./shared.types";
import Tag, { ITag } from "@/database/tag.model";
import { FilterQuery } from "mongoose";
import Question from "@/database/question.model";
import Interaction from "@/database/interaction.model";

export async function getAllTags(params: GetAllTagsParams) {
  try {
    await connectToDatabase();

    const { searchQuery, filter, page = 1, pageSize = 20 } = params;

    // Calculate the number of posts to skip based on the page number and page size
    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof Tag> = {};

    if (searchQuery) {
      query.$or = [{ name: { $regex: new RegExp(searchQuery, "i") } }];
    }

    let sortOptions: any = {};

    switch (filter) {
      case "popular":
        sortOptions = { questions: 1 };
        break;

      case "recent":
        sortOptions = { createdAt: -1 };
        break;

      case "old":
        sortOptions = { createdAt: 1 };
        break;

      case "name":
        sortOptions = { name: 1 };
        break;

      default:
        break;
    }

    const totalTags = await Tag.countDocuments(query);

    const tags = await Tag.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const isNext = totalTags > skipAmount + tags.length;

    return { tags, isNext };
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
}

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    await connectToDatabase();

    const { userId, limit = 3 } = params;

    // Find the user by clerkId
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Find interactions for the user and group by tags
    const tagCountMap = await Interaction.aggregate([
      { $match: { user: user._id, tags: { $exists: true, $ne: [] } } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    const topTags = tagCountMap.map((tagCount) => tagCount._id);

    // Find the tag documents for the top tags
    const topTagDocuments = await Tag.find({ _id: { $in: topTags } });

    return topTagDocuments;
  } catch (error) {
    console.error("Error fetching top interacted tags:", error);
    throw error;
  }
}

export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    await connectToDatabase();

    const { tagId, page = 1, pageSize = 10, searchQuery } = params;

    // Calculate the number of posts to skip based on the page number and page size
    const skipAmount = (page - 1) * pageSize;

    // Create a filter for the tag by ID
    const tagFilter: FilterQuery<ITag> = { _id: tagId };

    // Find the tag by ID and populate the questions field
    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: "i" } }
        : {},
      options: {
        sort: { createdAt: -1 },
        skip: skipAmount,
        limit: pageSize + 1, // +1 to check if there is a next page
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" }, // Populate the tags field of questions
        { path: "author", model: User, select: "_id clerkId name picture" }, // Populate the author field of questions
      ],
    });

    if (!tag) {
      throw new Error("Tag not found");
    }

    // Check if there is a next page
    const isNext = tag.questions.length > pageSize;

    // Extract the list of questions from the tag
    const questions = tag.questions;

    // Calculate the isNext indicator
    // TODO:

    return { tagTitle: tag.name, questions, isNext };
  } catch (error) {
    console.error("Error fetching questions by tag ID:", error);
    throw error;
  }
}

export async function getTopPopularTags() {
  try {
    await connectToDatabase();

    const popularTags = await Tag.aggregate([
      {
        $project: {
          name: 1,
          numberOfQuestions: { $size: "$questions" },
        },
      },
      {
        $sort: { numberOfQuestions: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    return popularTags;
  } catch (error) {
    console.error("Error fetching top popular tags:", error);
    throw error;
  }
}
