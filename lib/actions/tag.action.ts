import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { GetAllTagsParams, GetTopInteractedTagsParams } from "./shared.types";
import Tag from "@/database/tag.model";

export async function getAllTags(params: GetAllTagsParams) {
  try {
    connectToDatabase();

    const tags = await Tag.find({});

    return { tags };
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
}

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    await connectToDatabase();

    const { userId } = params;

    // Find the user by clerkId
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Find interactions for the user and group by tags
    // TODO:

    return [
      { _id: "1", name: "JS" },
      { _id: "2", name: "React" },
    ];
  } catch (error) {
    console.error("Error fetching top interacted tags:", error);
    throw error;
  }
}
