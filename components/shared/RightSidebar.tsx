import Link from "next/link";
import Image from "next/image";
import RenderTag from "./RenderTag";
import { getHotQuestions } from "@/lib/actions/question.action";

const popularTags = [
  {
    _id: "1",
    name: "React",
    totalQuestions: 5,
  },
  {
    _id: "1",
    name: "Next",
    totalQuestions: 4,
  },
  {
    _id: "1",
    name: "Vue",
    totalQuestions: 3,
  },
  {
    _id: "1",
    name: "Astro",
    totalQuestions: 7,
  },
  {
    _id: "1",
    name: "Remix",
    totalQuestions: 2,
  },
];

const RightSidebar = async () => {
  const hotQuestions = await getHotQuestions();

  return (
    <section className="custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 pt-36 shadow-light-300 dark:shadow-none max-xl:hidden">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {hotQuestions.map((question) => (
            <Link
              href={`/question/${question._id}`}
              key={question._id}
              className="flex cursor-pointer items-center justify-between gap-7"
            >
              <p className="body-medium text-dark500_light700">
                {question.title}
              </p>

              <Image
                src="/assets/icons/chevron-right.svg"
                alt="Chevron right icon"
                width={20}
                height={20}
                className="invert-colors"
              />
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          {popularTags.map((tag) => (
            <RenderTag
              key={tag._id}
              _id={tag._id}
              name={tag.name}
              totalQuestions={tag.totalQuestions}
              showCount
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
