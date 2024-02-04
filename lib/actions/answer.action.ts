"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../mongoose";

import { CreateAnswerParams } from "./shared.types";
import Answer from "@/database/answer.model";
import Question from "@/database/question.model";

export async function createAnswer(params: CreateAnswerParams) {
  try {
    connectToDatabase();
    const { content, author, question, path } = params;

    // Create the answer
    const newAnswer = new Answer({
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
