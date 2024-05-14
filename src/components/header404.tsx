import Image from "next/image";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";

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
    if (window && window.history) {
      // 获取核心URL部分
      var coreURL =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname;

      // 使用history.replaceState来修改URL，保持当前页面状态
      window.history.replaceState(null, "", coreURL);
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
        <Image alt="404 logo" height={30} src="/zink50-logo.png" width={30} />
        <div className=" ">
          <p className="text-md">ART-404</p>
        </div>
      </div>
      <div className="flex-item ml-auto" onClick={removeURLParameters}>
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
