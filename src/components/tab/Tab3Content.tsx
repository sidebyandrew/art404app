'use client';
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import {
  BASE_URL,
  ENDPOINT_MAINNET_RPC,
  ENDPOINT_TESTNET_RPC,
  isMainnet,
  isStayTuned,
  page_size,
  pink_mkt_cancel_sell_order_gas_fee,
} from '@/constant/config404';
import { addressTrim, calculateTotal, decimalFriendly } from '@/utils/util404';
import { SellOrderInfo } from '@/utils/interface404';
import { Address, toNano } from '@ton/core';
import { SendTransactionRequest } from '@tonconnect/sdk';
import { beginCell, TonClient } from '@ton/ton';

export default function Tab3Marketplace() {
  /* todo remove tma */
  // const tgInitData = useInitData();
  //
  const tgInitData = { user: { id: 5499157826, username: '' } };

  const router = useRouter();

  const [sellOrderList, setSellOrderList] = useState<SellOrderInfo[]>([]);
  const [mySellOrderList, setMySellOrderList] = useState<SellOrderInfo[]>([]);
  const [historySellOrderList, setHistorySellOrderList] = useState<SellOrderInfo[]>([]);
  const [logMsg404, setLogMsg404] = useState('');
  const [listedChanged, setListedChanged] = useState('');
  const [myOrderChanged, setMyOrderChanged] = useState('');
  const { toast } = useToast();

  const [onsalePageNumber, setOnsalePageNumber] = useState(1);
  const [myOpenPageNumber, setMyOpenPageNumber] = useState(1);
  const [myHistoryNumber, setMyHistoryNumber] = useState(1);

  async function clickCancel(sellOrderId: string) {
    console.info('sellOrderId to search', sellOrderId);
    console.info('sellOrderList', sellOrderList);

    let order = mySellOrderList.find(o => {
      return o.sellOrderId == sellOrderId;
    });


    console.info('order', order);
    if (order && order.sellAmount && order.unitPriceInTon
      && order.pinkOrderSaleAddress && order.extBizId) {

      let op_cancel_order = 0x68b4959e;
      let payloadCell = beginCell().storeUint(op_cancel_order, 32)  //op_code
        .storeUint(BigInt(order.extBizId), 64)  //query_id
        .endCell();
      ;
      let payloadBase64 = payloadCell.toBoc().toString('base64');

      let tx: SendTransactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: order.pinkOrderSaleAddress,
            amount: '' + toNano(pink_mkt_cancel_sell_order_gas_fee),
            payload: payloadBase64,
          },
        ],
      };

    } else {
      errorToast('SELL ORDER NOT FOUND WITH ID:' + sellOrderId);
    }
  }

  async function checkStatus(sellOrderId: string) {

    let order = mySellOrderList.find(o => {
      return o.sellOrderId == sellOrderId;
    });

    if (order && order.sellAmount && order.unitPriceInTon
      && order.pinkOrderSaleAddress && order.extBizId) {
      try {
        const client = new TonClient(
          {
            endpoint: isMainnet ? ENDPOINT_MAINNET_RPC : ENDPOINT_TESTNET_RPC,
          });
        const get_sale_data_tx = await client.runMethod(
          Address.parse(order.pinkOrderSaleAddress), 'get_sale_data');
        let get_sale_data_result = get_sale_data_tx.stack;
        // -1 init ok，0 not init
        let initFlagBigInt = get_sale_data_result.readBigNumber();
        if (initFlagBigInt && Number(initFlagBigInt) == -1) {
          quickToast('Congratulation!', 'This order is valid for public on-sale.');
          let tgId = tgInitData?.user?.id;
          if (tgId) {
            let urlWithParams = `${BASE_URL}/api/sell_order/update_state?tgId=${tgId}&extBizId=${order.extBizId}&status=ONSALE&access404=error_code_404`;
            const response = await fetch(urlWithParams);
            setMyOrderChanged(order.extBizId + Date.now());
            setListedChanged(order.extBizId + Date.now());
            if (!response.ok) {
              console.error(urlWithParams);
              return;
            }
          }
        } else {
          quickToast('Waiting', 'Please wait for smart contract initialization');
        }
      } catch (e) {
        console.error(e);
        if (e instanceof Error) {
          if (e.message.indexOf('Unable to execute get method.') == 0) {
            if (order.createDt && Date.now() - order.createDt > 1000 * 60 * 10) {
              quickToast('WARNING', 'This order is invalid, maybe you haven\'t sign with your wallet. Order status will set to INVALID.');
              let tgId = tgInitData?.user?.id;
              if (tgId) {
                let urlWithParams = `${BASE_URL}/api/sell_order/update_state?tgId=${tgId}&extBizId=${order.extBizId}&status=INVALID&access404=error_code_404`;
                setMyOrderChanged(order.extBizId + Date.now());
                setListedChanged(order.extBizId + Date.now());
                const response = await fetch(urlWithParams);
                if (!response.ok) {
                  console.error(urlWithParams);
                  return;
                }
              }
            } else {
              if (order.status == 'INIT') {
                quickToast('Please wait...', 'Please make sure to sign with your wallet.\nThe smart contract of this order need some time to deploy. ');
              } else {
                quickToast('Please wait...', 'The smart contract of this order need some time to deploy. ');
              }
            }
          } else {
            quickToast('Congratulation!', 'This order is valid for public on-sale.');
          }
        }
      }
    } else {
      errorToast('SELL ORDER NOT FOUND WITH ID:' + sellOrderId);
    }
  }

  function quickToast(title: string, description: string) {
    toast({
      title: title,
      description: description,
      action: (
        <ToastAction
          altText="OK">OK</ToastAction>
      ),
    });
  }

  function errorToast(errorCode: string) {
    quickToast('Error', `There is a system error, contact us pls. Error Code:[${errorCode}]`);
  }

  function badgeColor(status: string | undefined) {

    // INIT, PENDING, ONSALE, LOCK, SOLD, CANCELED, INVALID;

    if ('INIT' == status) {
      return 'gray';
    } else if ('PENDING' == status) {
      return 'purple';
    } else if ('ONSALE' == status) {
      return 'green';
    } else if ('LOCK' == status) {
      return 'purple';
    } else if ('SOLD' == status) {
      return 'blue';
    } else if ('CANCELED' == status) {
      return 'destructive';
    } else if ('INVALID' == status) {
      return 'secondary';
    } else {
      return 'outline';
    }

  }

  return (
    <div className="p-3">
      <div className="mb-3 text-2xl font-bold">ART-404 Pink Market
      </div>

      <div>
        <div className="p-5 flex justify-center text-white dark:text-white text-xl text-border">
          🚀 Will Open After Fair Mint
        </div>
      </div>

      {isStayTuned &&
        <div>
          <div className="pt-5 flex justify-center text-white dark:text-white text-xl text-border">
            🚀 Will Open After Mainnet Fair Mint
          </div>
        </div>
      }

      {!isStayTuned &&
        <Tabs defaultValue="listed" className="mx-auto">
          <TabsList>
            <TabsTrigger onClick={() => {
              setListedChanged('' + new Date());
            }} value="listed">Public On-Sale</TabsTrigger>
            <TabsTrigger onClick={() => {
              setMyOrderChanged('' + new Date());
            }} value="myOrders">My Open Orders</TabsTrigger>
            <TabsTrigger value="history">My History</TabsTrigger>
          </TabsList>
          <TabsContent value="listed" className="">
            <div className="  ">
              <Button className="flex ml-auto"
                      onClick={() => {
                       quickToast("Notice"," 🚀 Will Open After Fair Mint!")
                      }}
              >New Order</Button>
            </div>

            {/*  orders  */}
            <Table>
              <TableCaption>
                <div className={'p-1'}>Sort by price from lowest to highest.</div>

                {/*pagination */}
                <Pagination className={'p-2'}>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={
                        async () => {
                          if (onsalePageNumber > 1) {
                            //setOnsalePageNumber(onsalePageNumber - 1);
                          }
                        }
                      } />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink isActive>{onsalePageNumber}</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext onClick={
                        async () => {
                          if (sellOrderList && sellOrderList.length == page_size) {
                          }
                        }
                      } />
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
                  <TableHead className="">Price <div className={'font-light text-sm'}>(ART)</div></TableHead>
                  <TableHead className="">Total <div className={'font-light text-sm'}>(ART)</div></TableHead>
                  <TableHead className="">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellOrderList.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="">{(onsalePageNumber - 1) * page_size + index + 1}</TableCell>
                    <TableCell
                      className="font-extralight text-sm">{addressTrim(order.sellerAddress)}</TableCell>
                    <TableCell>{decimalFriendly(order.sellAmount)}</TableCell>
                    <TableCell>{decimalFriendly(order.unitPriceInTon)}</TableCell>
                    <TableCell
                      className="">{calculateTotal(order.sellAmount, order.unitPriceInTon)}</TableCell>
                    <TableCell className="ml-auto">
                      <Button
                        about={order.sellOrderId}
                        variant={'outline'}
                        onClick={() => {
                          if (order.sellOrderId) {
                          } else {
                            errorToast('SELL ORDER ID NOT FOUND');
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
                <div className={'p-1'}>Sort by create time.</div>
                {/*pagination */}
                <Pagination className={'p-2'}>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={
                        async () => {
                          if (myOpenPageNumber > 1) {
                            // setMyOpenPageNumber(myOpenPageNumber - 1);
                          }
                        }
                      } />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink isActive>{myOpenPageNumber}</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext onClick={
                        async () => {
                          if (mySellOrderList && mySellOrderList.length == page_size) {
                            //setMyOpenPageNumber(myOpenPageNumber + 1);
                          }
                        }
                      } />
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
                    <TableCell className="">{(myOpenPageNumber - 1) * page_size + index + 1}</TableCell>
                    <TableCell>{decimalFriendly(order.sellAmount)}</TableCell>
                    <TableCell>{decimalFriendly(order.unitPriceInTon)}</TableCell>
                    <TableCell
                      className="">{calculateTotal(order.sellAmount, order.unitPriceInTon)}</TableCell>
                    <TableCell className="">
                      <Badge
                        variant={badgeColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="">
                      {(order.status == 'INIT' || order.status == 'PENDING') && <Button
                        variant={'default'}
                        size={'sm'}
                        onClick={() => {
                          if (order.sellOrderId) {
                            checkStatus(order.sellOrderId);
                          } else {
                            errorToast('SELL ORDER ID NOT FOUND');
                          }
                        }}
                      >
                        Check Status
                      </Button>}
                      {order.status == 'ONSALE' && <Button
                        variant={'outline'}
                        size={'sm'}
                        onClick={() => {
                          if (order.sellOrderId) {
                            clickCancel(order.sellOrderId);
                          } else {
                            errorToast('SELL ORDER ID NOT FOUND');
                          }
                        }}
                      >
                        Cancel</Button>}
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
                <div className={'p-1'}>Sort by create time.</div>
                {/*pagination */}
                <Pagination className={'p-2'}>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={
                        async () => {
                          if (myHistoryNumber > 1) {
                            // setMyHistoryNumber(myHistoryNumber - 1);
                          }
                        }
                      } />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink isActive>{myHistoryNumber}</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext onClick={
                        async () => {
                          if (historySellOrderList && historySellOrderList.length == page_size) {
                            // setMyHistoryNumber(myHistoryNumber + 1);
                          }
                        }
                      } />
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
                    <TableCell className="">{(myHistoryNumber - 1) * page_size + index + 1}</TableCell>
                    <TableCell>{decimalFriendly(order.sellAmount)}</TableCell>
                    <TableCell>{decimalFriendly(order.unitPriceInTon)}</TableCell>
                    <TableCell
                      className="">{calculateTotal(order.sellAmount, order.unitPriceInTon)}</TableCell>
                    <TableCell className="">
                      <Badge
                        variant={badgeColor(order.status)}>
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
      }

      <div className="flex w-full flex-col pb-20">&nbsp;</div>
      <div className="mt-20  text-gray-600 text-center">
        <Popover>
          <PopoverTrigger className="text-gray-400">The trend is your friend.</PopoverTrigger>
          <PopoverContent
            className={'w-[300px] break-all'}>
            <div className={'break-all'}>{logMsg404}</div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex w-full flex-col pb-10">&nbsp;</div>

    </div>
  );
};

