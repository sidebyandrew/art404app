import Image from "next/image";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";

export default function Header404() {
  const router = useRouter();

  function getCoreURL() {
    return (
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname
    );
  }
  function removeURLParameters() {
    if (window && window.location) {
      // 获取核心URL部分
      var coreURL =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname;
      // 使用history.replaceState来修改URL，保持当前页面状态
      // window.history.replaceState(null, "", coreURL);
      if (window.location.href !== coreURL) {
        window.location.href = coreURL;
      }
    }
  }

  useEffect(() => {
    // 调用函数去除URL参数
    removeURLParameters();
  }, []);

  return (
    <div
      className="flex justify-between p-2"
      onClick={() => {
        router.push("/");
      }}
    >
      <div className="flex gap-1 items-center mx-auto">
        <Image
          alt="404 logo"
          height={30}
          src="/zink50-logo-with-round.png"
          width={30}
        />
        <div className=" ">
          <p className="text-md">ART-404</p>
        </div>
      </div>
      <div className="flex flex-item ml-auto">
        <Popover>
          <PopoverTrigger className="text-gray-400 mr-2">
            <QuestionMarkCircledIcon className="ml-2 text-white" />
          </PopoverTrigger>
          <PopoverContent className={"m-2 p-2"}>
            <p className={"text-xl text-red-500 mb-3"}>
              Wallet Connect at Mobile Phone have a lot of compatibility issues.
            </p>
            <ul className={"mb-3"}>
              <li>We recommend using Coinbase Wallet on your phone.</li>
            </ul>
            <div>
              {" "}
              If you insist on using MetaMask on your phone, then try this,
              there is no guarantee of results.
            </div>

            <Image
              src="/compatibilityissues.png"
              height={360}
              width={360}
              alt="pop"
            />
          </PopoverContent>
        </Popover>
        <ConnectButton
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
          showBalance={{
            smallScreen: false,
            largeScreen: true,
          }}
        />
      </div>
    </div>
  );
}
