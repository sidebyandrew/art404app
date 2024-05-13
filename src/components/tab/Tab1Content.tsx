import React, { useEffect, useState } from 'react';
import { SendTransactionRequest } from '@tonconnect/sdk';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Address } from '@ton/core';
import { TonClient } from '@ton/ton';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useMediaQuery } from '@/hooks/use-media-query';
import Autoplay from 'embla-carousel-autoplay';
import {
  BASE_NANO_BIGINT,
  BASE_NANO_NUMBER,
  defaultMintPrice,
  ENDPOINT_MAINNET_RPC,
  ENDPOINT_TESTNET_RPC,
  isMainnet,
  roundAccumulatedOffset,
  t404_jetton_master_address,
} from '@/constant/config404';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToastAction } from '@/components/ui/toast';
import { toast } from '@/components/ui/use-toast';


interface MintInfo {
  fetchFormRemote: boolean;
  freemintIsOpen?: boolean;
  freemintMaxSupply?: number;
  freemintCurrentSupply?: number;
  freemintTonPrice?: number;
  progressRate: number;
}


interface RpcErrorInfo {
  isRpcError: boolean;
  errorMsg?: string;
}


function buildTx(amount: number, mintInfo: MintInfo): SendTransactionRequest {

  let mintPrice: number = defaultMintPrice;
  if (mintInfo.fetchFormRemote && mintInfo.freemintTonPrice) {
    mintPrice = mintInfo.freemintTonPrice;
  }

  return {
    // let mintPrice:number = mintInfo.freemintTonPrice
    // The transaction is valid for 10 minutes from now, in unix epoch seconds.
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [
      {
        address: t404_jetton_master_address,
        amount: String(BASE_NANO_NUMBER * mintPrice * amount),
      },
    ],
  };

}


export default function Tab1Content() {
  /* todo remove tma */
  // const tgInitData = useInitData();
  //
  const tgInitData = { user: { id: 5499157826, username: '' } };

  const [rpcErrorInfo, setRpcErrorInfo] = useState<RpcErrorInfo>({ isRpcError: false, errorMsg: '' });
  const [mintInfo, setMintInfo] = useState<MintInfo>({ fetchFormRemote: false, progressRate: 0 });
  const [tx, setTx] = useState(buildTx(1, mintInfo));

  // mint amount
  const [mintAmount, setMintAmount] = useState(1);

  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [logMsg404, setLogMsg404] = useState('');

  let diamonds = [
    "A1_DanteAlighieri.webp",
    "A2_FrancescoPetrarca.webp",
    "A3_GiovanniBoccaccio.webp",
    "A4_Michelangelo.jpg",
    "Art404.jpg",
    "B1_FlorenceCathedral.jpg",
    "C1.webp",
    "C2_VitruvianMan.jpg"

  ];

  const handleIncrement = () => {
    if (mintAmount < 5) {
      setMintAmount(mintAmount + 1);
      setTx(buildTx(mintAmount + 1, mintInfo));
      return;
    }

    let jumpAmt = 5;
    if (mintAmount == 5) {
      jumpAmt = 10;
    } else if (mintAmount == 10) {
      jumpAmt = 20;
    } else if (mintAmount == 20) {
      jumpAmt = 50;
    } else if (mintAmount == 50) {
      jumpAmt = 100;
    } else if (mintAmount == 100) {
      jumpAmt = 500;
    } else if (mintAmount > 500) {
      return;
    }
    setMintAmount(jumpAmt);
    setTx(buildTx(jumpAmt, mintInfo));
  };

  const handleDecrement = () => {
    if (mintAmount >= 2) {
      setMintAmount(mintAmount - 1);
      setTx(buildTx(mintAmount - 1, mintInfo));
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const client = new TonClient(
          {
            endpoint: isMainnet ? ENDPOINT_MAINNET_RPC : ENDPOINT_TESTNET_RPC,
          });

        const master_tx = await client.runMethod(
          Address.parse(t404_jetton_master_address), 'get_404_jetton_data');
        // @ts-ignore

        let master_result = master_tx.stack;
        // let total_supply = master_result.readBigNumber();
        // let mintable = master_result.readBoolean();
        // let owner = master_result.readAddress();
        // let content = master_result.readCell();
        // let jetton_wallet_code = master_result.readCell();
        // let nft_collection_address = master_result.readAddress();

        //-1:true(can mint), 0:false(can not) : BACKEND USE, not for front end
        // let freemint_flag = master_result.readNumber();

        //3 000000000n 当前已经 mint 的数字
        // let freemint_current_supply = master_result.readBigNumber();
        // let freemint_current_supply_number = Number(freemint_current_supply / BASE_NANO_BIGINT) - roundAccumulatedOffset;

        //1000 000000000n
        // let freemint_max_supply = master_result.readBigNumber();
        // let freemint_max_supply_number = Number(freemint_max_supply / BASE_NANO_BIGINT) - roundAccumulatedOffset;


        let max_supply = master_result.readBigNumber();
        let mintable = master_result.readBoolean();
        let owner = master_result.readAddress();
        let content = master_result.readCell();
        let jetton_wallet_code = master_result.readCell();
        let nft_item_code = master_result.readCell();
        let nft_collection_address = master_result.readAddress();
        let freemint_flag = master_result.readNumber();
        let freemint_current_supply = master_result.readBigNumber();
        let freemint_max_supply = master_result.readBigNumber();
        let freemint_price = master_result.readBigNumber();
        let total_supply = master_result.readBigNumber();

        let freemint_current_supply_number = Number(freemint_current_supply / BASE_NANO_BIGINT) - roundAccumulatedOffset;
        let freemint_max_supply_number = Number(freemint_max_supply / BASE_NANO_BIGINT) - roundAccumulatedOffset;


        //1 000000000n
        let freemint_price_number = Number(freemint_price);
        let mintInfo: MintInfo = {
          fetchFormRemote: true,
          freemintIsOpen: freemint_max_supply_number - freemint_current_supply_number > 1,
          freemintCurrentSupply: freemint_current_supply_number,
          freemintMaxSupply: freemint_max_supply_number,
          freemintTonPrice: freemint_price_number / BASE_NANO_NUMBER,
          progressRate: Number(Number(100 * freemint_current_supply_number / freemint_max_supply_number).toFixed(1)),
        };

        setMintInfo(mintInfo);
        setTx(buildTx(1, mintInfo));


      } catch (error) {
        let msg = 'Error: Fail to fetch data from  RPC. \n';
        if (error instanceof Error) {
          msg = msg + error.message;
        }

        setRpcErrorInfo({ isRpcError: true, errorMsg: msg });
      }
    };

    // Only execute fetchData if running in the browser
    if (typeof window !== 'undefined') {
      fetchData().catch(r => {
        console.error('Sorry, I need window to run.' + r);
      });
    }
  }, []);


  async function processMint(tx: SendTransactionRequest) {
    let result = false;
    let tgId = tgInitData?.user?.id;
    let loginWallet = 'wallet?.account?.address';
    // if (tgId && loginWallet) {
    //   let sellTx: SendTransactionResponse = await tonConnectUi.sendTransaction(tx);
    //   let txCells = Cell.fromBoc(Buffer.from(sellTx.boc, 'base64'));
    //   if (txCells && txCells[0]) {
    //     let urlWithParams = `${BASE_URL}/api/mint?tgId=${tgId}&loginWallet=${loginWallet}&mintAmount=${mintAmount}&access404=error_code_404`;
    //     const response = await fetch(urlWithParams);
    //     if (!response.ok) {
    //       console.error(urlWithParams);
    //     }
    //     result = true;
    //   } else {
    //     console.info('User have not sign the tx!!!!!!');
    //   }
    // } else {
    //   console.error(`User Info Error: ${tgId}, ${loginWallet}`);
    // }

    return result;
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

  return (
    < div className="px-3 justify-center items-center">
      {/* Carousel*/}
      <Carousel className="  px-1 justify-center items-center" plugins={[
        Autoplay({
          delay: 6000,
        }),
      ]}>
        <CarouselContent>
          {diamonds.map((diamond, index) => (
            <CarouselItem key={index}>
              <CardContent className="flex items-center justify-center p-0">
                <Card className={'flex justify-center border-0 h-[280px] w-[280px]'}>
                  <Image
                    alt=" app"
                    className="w-full h-full object-fill"
                    width="180"
                    height="180"
                    src={'/diamonds/' + diamond}
                  />
                </Card>
              </CardContent>
            </CarouselItem>))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>


      <div className="mt-4 mb-2 text-2xl">Fair Mint
        {!isMainnet && <span className="text-pink-400 text-lg">&nbsp;Artela Testnet</span>}
      </div>
      <div className="flex flex-col">

        {/*{rpcErrorInfo.isRpcError &&*/}

        {/*  <div className="flex flex-col space-y-3 items-center">*/}

        {/*    <Skeleton className="h-[125px] w-[250px] rounded-xl" />*/}
        {/*    <div className="space-y-2">*/}
        {/*      <Skeleton className="h-4 w-[250px]" />*/}
        {/*      <Skeleton className="h-4 w-[200px]" />*/}
        {/*    </div>*/}
        {/*    <div className="text-red-400">TON RPC Server is busy, but you can try to mint.</div>*/}
        {/*  </div>*/}

        {/*}*/}
        {/*{!rpcErrorInfo.isRpcError && <div>*/}

        {/*  {mintInfo.fetchFormRemote && mintInfo.freemintIsOpen && (*/}
        {/*    <div className="flex justify-center text-gray-400">*/}
        {/*      Minted Count：{mintInfo.freemintCurrentSupply}*/}
        {/*    </div>)}*/}

        {/*  <div className="flex justify-center  text-gray-400">*/}
        {/*    Round Supply：{mintInfo.freemintMaxSupply}*/}
        {/*  </div>*/}
        {/*  {mintInfo.fetchFormRemote && (*/}

        {/*    <div className="flex justify-center text-gray-400">*/}
        {/*      Price：Dynamic from {mintInfo.freemintTonPrice} to 5.2 Toncion*/}
        {/*      <Popover>*/}
        {/*        <PopoverTrigger className="text-gray-400">*/}
        {/*          <QuestionMarkCircledIcon className="ml-2 text-yellow-500" />*/}
        {/*        </PopoverTrigger>*/}
        {/*        <PopoverContent>*/}
        {/*          Index from 1 to 650, 4.04 TON*/}
        {/*          Index from 650 to 850, 4.4 TON*/}
        {/*          Index from 850-950, 4.8 TON*/}
        {/*          Index from 950-1000, 5.2 TON*/}
        {/*        </PopoverContent>*/}
        {/*      </Popover>*/}
        {/*    </div>*/}

        {/*  )}*/}
        {/*  <div className="flex justify-center text-gray-400">*/}
        {/*    Period：{FAIR_MINT_PERIOD}*/}
        {/*  </div>*/}
        {/*  {mintInfo.fetchFormRemote && (*/}
        {/*    <div className="flex items-center justify-center ">*/}
        {/*      <Progress*/}
        {/*        value={mintInfo.progressRate}*/}
        {/*      />*/}
        {/*      <div className=" text-gray-400">&nbsp;{mintInfo.progressRate}%</div>*/}
        {/*    </div>)}*/}

        {/*</div>}*/}


        <div className="flex flex-col mt-3">
          {'wallet?.account?.address' &&
            <>
              {/*mint amount start*/}
              {/*<div className="flex mb-2 items-center">*/}
              {/*  <div className="text-lg ">Mint Amount: &nbsp;</div>*/}

              {/*  <Button*/}
              {/*    variant={'outline'}*/}
              {/*    className="focus:outline-none text-2xl"*/}
              {/*    onClick={handleDecrement}*/}
              {/*  >*/}
              {/*    -*/}
              {/*  </Button>*/}
              {/*  <div className="mx-3 text-xl"> {mintAmount} </div>*/}
              {/*  <Button*/}
              {/*    variant={'outline'}*/}
              {/*    className="focus:outline-none text-2xl"*/}
              {/*    onClick={handleIncrement}*/}
              {/*  >*/}
              {/*    +*/}
              {/*  </Button>*/}
              {/*</div>*/}
              {/*mint amount end*/}

              <Button
                size={'lg'}
                variant={mintInfo.freemintIsOpen ? 'default' : 'outline'}
                disabled={mintInfo.freemintIsOpen === false}
                onClick={() => {


                  return processMint(tx);
                }
                }>
                {mintInfo.freemintIsOpen === false ? 'Fair Mint Finished' : 'Fair Mint'}
              </Button>

            </>}
          {!'wallet?.account?.address' &&
            <Button variant={'secondary'} size="lg" color="primary" onClick={() => {
              // if (!tonConnectUi.connected) {
              //   return tonConnectUi.openModal();
              // } else {
              //   return tonConnectUi.sendTransaction(tx);
              // }
            }}>
              Connect Wallet to Fair Mint
            </Button>
          }
        </div>
      </div>


      {/* FAQ   */}
      <div className="flex w-full flex-col pb-8">&nbsp;</div>
      <div className="  text-2xl">FAQ</div>
      <Accordion type="single" collapsible>
        <AccordionItem value="1">
          <AccordionTrigger>What is ART-404?</AccordionTrigger>
          <AccordionContent>
            <p className="text-gray-400 indent-6">ART-404 is an innovative, mixed Jetton & NFT
              implementation
              with
              native liquidity and
              fractionalization for semi-fungible tokens.</p>
            <p className="pt-2 text-gray-400 indent-6">This project is inspired by ERC-404, and now is the
              first
              project
              implemented
              ERC-404 protocol
              on Artela.</p>


          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="2">
          <AccordionTrigger>What is the key values?</AccordionTrigger>
          <AccordionContent>
            <ul className="px-1">
              <li className="text-gray-400">1. Powered by AIGC, all the NFT is a real AI artwork.</li>
              <li className="text-gray-400">2. Submit Artela Enhancement Proposals 404 Standard</li>
              <li className="text-gray-400">3. Native Telegram Bot and Mini-App with Artela Wallet Connect</li>
              <li className="text-gray-400">4. Fully compatible with Artela ecosystem.
              </li>
              <li className="text-gray-400">5. Incentive Tokenomics, visionary roadmap and future plan
              </li>
            </ul>
          </AccordionContent>

        </AccordionItem>
        <AccordionItem value="3" aria-label="Accordion 3">
          <AccordionTrigger>What about Tokenomics?</AccordionTrigger>
          <AccordionContent>
            <p className="text-gray-400">Total Supply: 10K.</p>
            <p className="text-gray-400">The same as <a href="https://coinmarketcap.com/view/erc-404/">ERC-404 Pandona</a></p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {/* FAQ   */}


      {/* Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-center">
              Must Connect
            </DrawerTitle>
            <DrawerDescription>
              Must Connect
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="pt-2 pb-5">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      {/* Drawer End */}
      <div className="flex w-full flex-col pb-20">&nbsp;</div>
      <div className="mt-20 mb-20 text-gray-600 text-center">
        <Popover>
          <PopoverTrigger className="text-gray-400">Diamonds are forever.</PopoverTrigger>
          <PopoverContent
            className={'w-[300px] break-all'}>
            <div className={'break-all'}>{logMsg404}</div>
          </PopoverContent>
        </Popover>
      </div>
    </div>


  );
}

