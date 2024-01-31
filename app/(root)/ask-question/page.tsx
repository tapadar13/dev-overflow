import Question from "@/components/forms/Question";
import React from "react";

const Page = () => {
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Ask a question</h1>
      <div className="mt-9">
        <Question />
      </div>
    </>
  );
};

export default Page;
