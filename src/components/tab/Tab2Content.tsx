import React, { CSSProperties, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { isMainnet } from "@/constant/config404";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { BeatLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { decimalFriendly } from "@/utils/util404";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "white",
};
export default function Tab2Asset() {
  const [jettonBalance, setJettonBalance] = useState("");
  const [jettonAddress, setJettonAddress] = useState("");

  let [jettonLoading, setJettonLoading] = useState(true);
  const [nftCount, setNftCount] = useState("");
  let [nftLoading, setNftLoading] = useState(true);
  const [nftCollection, setNftCollection] = useState("");

  const [userData, setUserData] = useState(null);
  const [logMsg404, setLogMsg404] = useState("");

  let [oldA404Existing, setOldA404Existing] = useState(false);

  let [oldA404Address, setOldA404Address] = useState("");
  const [oldA404Balance, setOldA404Balance] = useState(0);
  let [oldA404Upgrading, setOldA404Upgrading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const { toast } = useToast();

  // 1. 定义验证逻辑
  const formSchema = z.object({
    receiverAddress: z.coerce
      .string()
      .length(48, { message: "Address length must be 48." }),
    sendAmount: z.coerce
      .number()
      .gte(0, {
        message: "Send Amount must be greater than 0.",
      })
      .max(10000, "Send Amount must less than 10,000."),
  });

  // 2. 定义表单组件实例（解析器，默认值）
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  // 3. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.info("=============");
    console.info("======onSubmit=======");
    console.info("======onSubmit=======");
    try {
      if (!"wallet?.account?.address") {
        toast({
          title: "WARN",
          description: `Please connect your wallet firstly!`,
          action: <ToastAction altText="Goto schedule to undo">OK</ToastAction>,
        });
        return;
      }
      if (jettonLoading) {
        toast({
          title: "WARN",
          description: `Please wait the app to load your A404 balance!`,
          action: <ToastAction altText="Goto schedule to undo">OK</ToastAction>,
        });
        return;
      }
      if (values.sendAmount && values.sendAmount > parseFloat(jettonBalance)) {
        toast({
          title: "ERROR",
          description: `You cannot sell more than your balance ${jettonBalance}!`,
          action: <ToastAction altText="Goto schedule to undo">OK</ToastAction>,
        });
        return;
      }

      if (isMainnet && values.receiverAddress) {
        if (
          !(
            values.receiverAddress.startsWith("UQ") ||
            values.receiverAddress.startsWith("EQ")
          )
        ) {
          toast({
            title: "ERROR",
            description: `Mainnet address must start with UQ or EQ!`,
            action: (
              <ToastAction altText="Goto schedule to undo">OK</ToastAction>
            ),
          });
          return;
        }
      }
      if (!isMainnet && values.receiverAddress) {
        if (
          !(
            values.receiverAddress.startsWith("kQ") ||
            values.receiverAddress.startsWith("0Q")
          )
        ) {
          toast({
            title: "ERROR",
            description: `Testnet address must start with kQ or 0Q!`,
            action: (
              <ToastAction altText="Goto schedule to undo">OK</ToastAction>
            ),
          });
          return;
        }
      }

      setProcessing(true);

      setProcessing(false);
    } catch (error) {
      setProcessing(false);
      if (error instanceof Error) {
        console.error(error.message);
      }
      console.error("Transfer error :", error);
    }
  }

  function quickToast(title: string, description: string) {
    toast({
      title: title,
      description: description,
      action: <ToastAction altText="OK">OK</ToastAction>,
    });
  }

  function isValidWallet() {
    let success = true;

    if (!"wallet?.account?.address") {
      success = false;
      quickToast("Warning", "You need to connect wallet!");
    }

    return success;
  }

  const normalizeInput = (value: any) => {
    if (parseFloat(value) < 0 || value === "-") {
      return "1";
    }

    if (/\.\d{3,}/.test(value)) {
      return parseFloat(value).toFixed(2);
    }

    return value;
  };

  return (
    <div className="p-3">
      {oldA404Existing && (
        <div>
          <div className=" text-xl font-bold">Old 404 Jettons</div>

          {oldA404Upgrading && (
            <div className="pt-2 pb-2 text-xl font-bold text-red-400">
              Old 404 Upgrading, check result 5 minutes later, DO NOT submit
              again!
            </div>
          )}
          <Table>
            <TableCaption>
              <div className={"pb-3"}>
                * Need 0.4 Toncoin for upgrading gas fee, pay 1 Toncoin firstly,
                excess will be refunded.
              </div>
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="">#</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  <Image
                    src="/logos/ART-404-gray.png"
                    height={36}
                    width={36}
                    alt=""
                  />
                </TableCell>
                <TableCell>Old A404</TableCell>
                <TableCell>{oldA404Balance}</TableCell>
                <TableCell className="text-center">
                  <Button
                    size={"lg"}
                    variant={"default"}
                    disabled={oldA404Upgrading}
                    onClick={() => {}}
                  >
                    Upgrade
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}

      <div className=" text-xl font-bold">New 404 Jettons</div>

      <Table>
        <TableCaption></TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="">#</TableHead>
            <TableHead>Token</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">
              {" "}
              <Image src="/logo-circle.png" height={36} width={36} alt="pop" />
            </TableCell>
            <TableCell>A404</TableCell>
            <TableCell>
              <BeatLoader
                color={"#ffffff"}
                loading={jettonLoading}
                cssOverride={override}
                size={12}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
              {decimalFriendly(jettonBalance)}
            </TableCell>
            <TableCell className="text-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={jettonLoading}>
                    Transfer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Transfer A404</DialogTitle>
                    <DialogDescription>
                      Transfer Your A404 to other Wallet Address
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-8"
                    >
                      <FormField
                        control={form.control}
                        name="receiverAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recipient Wallet Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="UQ..."
                                {...field}
                                className={"font-extralight text-sm"}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sendAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>A404 Amount </FormLabel>
                            <FormControl>
                              <Input placeholder="amount" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your A404 Balance: {jettonBalance}
                            </FormDescription>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit">Submit</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}></TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <div className="mt-3 text-xl font-bold">404 Collectibles</div>
      <Table>
        <TableCaption></TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="">#</TableHead>
            <TableHead>NFT</TableHead>
            <TableHead>Count</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">
              {" "}
              <Image src="/vivid.png" height={36} width={36} alt="pop" />
            </TableCell>
            <TableCell>404 Replicant NFT</TableCell>
            <TableCell>
              <BeatLoader
                color={"#ffffff"}
                loading={nftLoading}
                cssOverride={override}
                size={12}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
              {nftCount}
            </TableCell>
            <TableCell className="text-center">
              <Button
                variant={"outline"}
                disabled={nftLoading}
                onClick={() => {}}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  width="24"
                  height="24"
                  viewBox="0 0 36 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18 2c0 8.837-7.163 16-16 16C2 9.163 9.163 2 18 2zm0 32C9.163 34 2 26.837 2 18c8.837 0 16 7.163 16 16zm16-16c0 8.837-7.163 16-16 16 0-8.837 7.163-16 16-16zM32 4c0 6.627-5.373 12-12 12 0-6.627 5.373-12 12-12z"
                    fill="currentColor"
                  ></path>
                </svg>
                Sell
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <div className="flex justify-end mr-2">
        <Popover>
          <PopoverTrigger className="text-gray-400">
            * Notes for Getgems
          </PopoverTrigger>
          <PopoverContent>
            The index of Getgems has a delay, at some time you need to refresh
            metadata manually at Getgems website.
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex w-full flex-col pb-20">&nbsp;</div>
      <div className="mt-20 mb-20 text-gray-600 text-center">
        <Popover>
          <PopoverTrigger className="text-gray-400">
            It takes money to make money....
          </PopoverTrigger>
          <PopoverContent>{logMsg404}</PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
