"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { isStayTuned, page_size } from "@/constant/config404";
import { addressTrim, calculateTotal, decimalFriendly } from "@/utils/util404";
import { SellOrderInfo } from "@/utils/interface404";

export default function Tab3Marketplace() {
  /* todo remove tma */
  // const tgInitData = useInitData();
  //
  const tgInitData = { user: { id: 5499157826, username: "" } };

  const router = useRouter();

  const [sellOrderList, setSellOrderList] = useState<SellOrderInfo[]>([]);
  const [mySellOrderList, setMySellOrderList] = useState<SellOrderInfo[]>([]);
  const [historySellOrderList, setHistorySellOrderList] = useState<
    SellOrderInfo[]
  >([]);
  const [logMsg404, setLogMsg404] = useState("");
  const [listedChanged, setListedChanged] = useState("");
  const [myOrderChanged, setMyOrderChanged] = useState("");
  const { toast } = useToast();

  const [onsalePageNumber, setOnsalePageNumber] = useState(1);
  const [myOpenPageNumber, setMyOpenPageNumber] = useState(1);
  const [myHistoryNumber, setMyHistoryNumber] = useState(1);

  function quickToast(title: string, description: string) {
    toast({
      title: title,
      description: description,
      action: <ToastAction altText="OK">OK</ToastAction>,
    });
  }

  function errorToast(errorCode: string) {
    quickToast(
      "Error",
      `There is a system error, contact us pls. Error Code:[${errorCode}]`,
    );
  }

  function badgeColor(status: string | undefined) {
    // INIT, PENDING, ONSALE, LOCK, SOLD, CANCELED, INVALID;

    if ("INIT" == status) {
      return "gray";
    } else if ("PENDING" == status) {
      return "purple";
    } else if ("ONSALE" == status) {
      return "green";
    } else if ("LOCK" == status) {
      return "purple";
    } else if ("SOLD" == status) {
      return "blue";
    } else if ("CANCELED" == status) {
      return "destructive";
    } else if ("INVALID" == status) {
      return "secondary";
    } else {
      return "outline";
    }
  }

  return (
    <div className="p-3">
      <div className="mb-3 text-2xl font-bold">ART-404 Pink Market</div>

      <div>
        <div className="p-5 flex justify-center text-white dark:text-white text-xl text-border">
          🚀 Will Open After Fair Mint
        </div>
      </div>

      {isStayTuned && (
        <div>
          <div className="pt-5 flex justify-center text-white dark:text-white text-xl text-border">
            🚀 Will Open After Mainnet Fair Mint
          </div>
        </div>
      )}

      {!isStayTuned && (
        <Tabs defaultValue="listed" className="mx-auto">
          <TabsList>
            <TabsTrigger
              onClick={() => {
                setListedChanged("" + new Date());
              }}
              value="listed"
            >
              Public On-Sale
            </TabsTrigger>
            <TabsTrigger
              onClick={() => {
                setMyOrderChanged("" + new Date());
              }}
              value="myOrders"
            >
              My Open Orders
            </TabsTrigger>
            <TabsTrigger value="history">My History</TabsTrigger>
          </TabsList>
          <TabsContent value="listed" className="">
            <div className="  ">
              <Button
                className="flex ml-auto"
                onClick={() => {
                  quickToast("Notice", " 🚀 Will Open After Fair Mint!");
                }}
              >
                New Order
              </Button>
            </div>

            {/*  orders  */}
            <Table>
              <TableCaption>
                <div className={"p-1"}>
                  Sort by price from lowest to highest.
                </div>

                {/*pagination */}
                <Pagination className={"p-2"}>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={async () => {
                          if (onsalePageNumber > 1) {
                            //setOnsalePageNumber(onsalePageNumber - 1);
                          }
                        }}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink isActive>
                        {onsalePageNumber}
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={async () => {
                          if (
                            sellOrderList &&
                            sellOrderList.length == page_size
                          ) {
                          }
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                {/*pagination end*/}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead className="w-[100px]">Seller</TableHead>
                  <TableHead>A404</TableHead>
                  <TableHead className="">
                    Price <div className={"font-light text-sm"}>(ART)</div>
                  </TableHead>
                  <TableHead className="">
                    Total <div className={"font-light text-sm"}>(ART)</div>
                  </TableHead>
                  <TableHead className="">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellOrderList.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="">
                      {(onsalePageNumber - 1) * page_size + index + 1}
                    </TableCell>
                    <TableCell className="font-extralight text-sm">
                      {addressTrim(order.sellerAddress)}
                    </TableCell>
                    <TableCell>{decimalFriendly(order.sellAmount)}</TableCell>
                    <TableCell>
                      {decimalFriendly(order.unitPriceInTon)}
                    </TableCell>
                    <TableCell className="">
                      {calculateTotal(order.sellAmount, order.unitPriceInTon)}
                    </TableCell>
                    <TableCell className="ml-auto">
                      <Button
                        about={order.sellOrderId}
                        variant={"outline"}
                        onClick={() => {
                          if (order.sellOrderId) {
                          } else {
                            errorToast("SELL ORDER ID NOT FOUND");
                          }
                        }}
                      >
                        Buy
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6}></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <div className="flex w-full flex-col pb-20">&nbsp;</div>
            {/*  orders end  */}
          </TabsContent>
          <TabsContent value="myOrders">
            <Table>
              <TableCaption>
                <div className={"p-1"}>Sort by create time.</div>
                {/*pagination */}
                <Pagination className={"p-2"}>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={async () => {
                          if (myOpenPageNumber > 1) {
                            // setMyOpenPageNumber(myOpenPageNumber - 1);
                          }
                        }}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink isActive>
                        {myOpenPageNumber}
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={async () => {
                          if (
                            mySellOrderList &&
                            mySellOrderList.length == page_size
                          ) {
                            //setMyOpenPageNumber(myOpenPageNumber + 1);
                          }
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                {/*pagination end*/}
              </TableCaption>
              <TableHeader>
                <TableRow className="text-center text-sm">
                  <TableHead className="px-0 text-center">#</TableHead>
                  <TableHead className="px-0 text-center">A404</TableHead>
                  <TableHead className="px-0 text-center">Price</TableHead>
                  <TableHead className="px-0 text-center">Total</TableHead>
                  <TableHead className="px-0 text-center">Status</TableHead>
                  <TableHead className="px-0 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {mySellOrderList.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="">
                      {(myOpenPageNumber - 1) * page_size + index + 1}
                    </TableCell>
                    <TableCell>{decimalFriendly(order.sellAmount)}</TableCell>
                    <TableCell>
                      {decimalFriendly(order.unitPriceInTon)}
                    </TableCell>
                    <TableCell className="">
                      {calculateTotal(order.sellAmount, order.unitPriceInTon)}
                    </TableCell>
                    <TableCell className="">
                      <Badge variant={badgeColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="">
                      {(order.status == "INIT" ||
                        order.status == "PENDING") && (
                        <Button
                          variant={"default"}
                          size={"sm"}
                          onClick={() => {
                            if (order.sellOrderId) {
                            } else {
                              errorToast("SELL ORDER ID NOT FOUND");
                            }
                          }}
                        >
                          Check Status
                        </Button>
                      )}
                      {order.status == "ONSALE" && (
                        <Button
                          variant={"outline"}
                          size={"sm"}
                          onClick={() => {
                            if (order.sellOrderId) {
                            } else {
                              errorToast("SELL ORDER ID NOT FOUND");
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6}></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <div className="flex w-full flex-col pb-24">&nbsp;</div>
          </TabsContent>
          <TabsContent value="history">
            <Table>
              <TableCaption>
                <div className={"p-1"}>Sort by create time.</div>
                {/*pagination */}
                <Pagination className={"p-2"}>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={async () => {
                          if (myHistoryNumber > 1) {
                            // setMyHistoryNumber(myHistoryNumber - 1);
                          }
                        }}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink isActive>
                        {myHistoryNumber}
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={async () => {
                          if (
                            historySellOrderList &&
                            historySellOrderList.length == page_size
                          ) {
                            // setMyHistoryNumber(myHistoryNumber + 1);
                          }
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                {/*pagination end*/}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>A404</TableHead>
                  <TableHead className="">Price</TableHead>
                  <TableHead className="">Total</TableHead>
                  <TableHead className="">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historySellOrderList.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="">
                      {(myHistoryNumber - 1) * page_size + index + 1}
                    </TableCell>
                    <TableCell>{decimalFriendly(order.sellAmount)}</TableCell>
                    <TableCell>
                      {decimalFriendly(order.unitPriceInTon)}
                    </TableCell>
                    <TableCell className="">
                      {calculateTotal(order.sellAmount, order.unitPriceInTon)}
                    </TableCell>
                    <TableCell className="">
                      <Badge variant={badgeColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5}></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <div className="flex w-full flex-col pb-24">&nbsp;</div>
            <div className="flex w-full flex-col pb-24">&nbsp;</div>
          </TabsContent>
        </Tabs>
      )}

      <div className="flex w-full flex-col pb-20">&nbsp;</div>
      <div className="mt-20  text-gray-600 text-center">
        <Popover>
          <PopoverTrigger className="text-gray-400">
            The trend is your friend.
          </PopoverTrigger>
          <PopoverContent className={"w-[300px] break-all"}>
            <div className={"break-all"}>{logMsg404}</div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex w-full flex-col pb-10">&nbsp;</div>
    </div>
  );
}
