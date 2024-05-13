import Image from 'next/image';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';


export default function Header404() {
    const router = useRouter();
    return (
        <div className="flex justify-between p-2" onClick={() => {
            router.push('/');
        }}>
            <div className="flex gap-1 items-center mx-auto">
                <Image
                  alt="404 logo"
                  height={30}
                  src="/zink50-logo.png"
                  width={30}
                />
                <div className=" ">
                    <p className="text-md">ART-404</p>
                </div>
            </div>
            <div className="flex-item ml-auto">
                <ConnectButton />
            </div>
        </div>
    );
}
