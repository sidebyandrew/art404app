"use client";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { decimalFriendly } from "@/utils/util404";
import { useRouter } from "next/navigation";
import { ReloadIcon } from "@radix-ui/react-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableRow,
} from "@/components/ui/table";
import { BeatLoader } from "react-spinners";

export default function Page({ params }: { params: { lang: string } }) {
  const router = useRouter();

  const [jettonBalance, setJettonBalance] = useState("");
  let [jettonLoading, setJettonLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const formSchema = z.object({
    sellAmount: z.coerce
      .number()
      .gte(0, {
        message: "A404 sell amount must be greater than 0.",
      })
      .max(1000, "Sell amount must less than 1,000 in one order."),
    unitPrice: z.coerce
      .number()
      .gte(0, {
        message: "Unit price must be greater than 0.",
      })
      .max(100000, "Unit price must less than 100,000 Toncoins."),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  // 2. Define a submit handler.

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
    <div
      className={"px-6"}
      style={{
        touchAction: "manipulation",
        msTouchAction: "manipulation",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
        msContentZooming: "none",
        overflow: "hidden",
        width: "100vw",
        height: "100vh",
      }}
    >
      <Breadcrumb className="pb-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/#tab3">Pink Market</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Sell Order</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {!submitted && (
        <Form {...form}>
          <div className=" text-xl font-bold">Your Balance</div>

          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  <Image
                    src="/logo-circle.png"
                    height={36}
                    width={36}
                    alt="pop"
                  />
                </TableCell>
                <TableCell>A404</TableCell>
                <TableCell>
                  <BeatLoader
                    color={"#ffffff"}
                    loading={jettonLoading}
                    size={12}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                  {decimalFriendly(jettonBalance)}
                </TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}></TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          <form
            // onSubmit={form.handleSubmit(onSubmit)}
            className="w-2/3 space-y-6"
          >
            <FormField
              control={form.control}
              name="sellAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sell Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="text-lg"
                      placeholder=""
                      {...field}
                      onChange={(e) =>
                        field.onChange(normalizeInput(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    How many A404 you want to sell.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Price in Toncoin</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="text-lg"
                      placeholder=""
                      {...field}
                      onChange={(e) =>
                        field.onChange(normalizeInput(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    How much is a A404 for Toncoin?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" variant={"default"} disabled={processing}>
              {processing && (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit
            </Button>

            <Button
              disabled={processing}
              variant={"outline"}
              className="ml-3"
              type="button"
              onClick={() => {
                router.push("/#tab3");
              }}
            >
              Back
            </Button>
          </form>
        </Form>
      )}

      {submitted && (
        <div className="h-full my-auto flex flex-col items-center">
          <div className="mt-36"></div>
          <div className="text-xl">Sell Order Submitted.</div>
          <div className="text-gray-300">
            Your order submitted successfully.
          </div>

          <div className="mt-5"></div>

          <div className="flex gap-2">
            <Button
              disabled={processing}
              variant={"default"}
              className=""
              type="button"
              onClick={() => {
                router.push("/#tab3");
              }}
            >
              Back to Market
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
