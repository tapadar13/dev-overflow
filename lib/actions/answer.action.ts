"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../mongoose";

import { CreateAnswerParams, GetAnswersParams } from "./shared.types";
import Answer from "@/database/answer.model";
import Question from "@/database/question.model";

export async function createAnswer(params: CreateAnswerParams) {
  try {
    connectToDatabase();
    const { content, author, question, path } = params;

    // Create the answer
    const newAnswer = await Answer.create({
      content,
      author,
      question,
    });

    // Add the answer to the question's answers array
    await Question.findByIdAndUpdate(
      question,
      {
        $push: { answers: newAnswer._id },
      },
      { new: true }
    );

    // Create an Interaction record for the user's answer action
    // TODO:

    // Increment author's reputation by +10 for creating an answer
    // TODO:

    revalidatePath(path);
  } catch (error) {
    console.error("Error creating answer:", error);
    return null;
  }
}

export async function getAnswers(params: GetAnswersParams) {
  try {
    connectToDatabase();

    const { questionId } = params;

    // Calculate the number of posts to skip based on the page number and page size.
    // TODO

    const answers = await Answer.find({ question: questionId })
      .populate({
        path: "author",
        select: "_id clerkId name picture",
      })
      .sort({ createdAt: -1 });

    // Check if there are more answers beyond the current set
    // TODO:

    return { answers };
  } catch (error) {
    console.error("Error fetching answers:", error);
    throw error;
  }
}
