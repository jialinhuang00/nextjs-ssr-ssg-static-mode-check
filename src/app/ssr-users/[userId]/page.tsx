import { Metadata } from "next";

type Params = {
  params: {
    userId: string;
  };
};
export default async function SSRPage({ params: { userId } }: Params) {
  return <p className="text-black">params is {userId} </p>;
}
