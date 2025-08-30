"use client"


import { Issue } from "@/components/issue";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import Pattern from "@/components/pattern";


export default function CitizenPortal() {
  
  return (
    
    <div className="relative flex flex-col mt-16">
      <Pattern />
      <Card className="flex flex-row justify-between mx-5 p-0 items-center">
        <Label className="m-5 text-lg font-semibold">Total Issues (count) </Label>
        <Button className="m-5">Report an issue</Button>
       
      </Card>
      <div className="flex flex-col mx-5 gap-5 my-5">
        <Issue />
        <Issue />
        <Issue />
        <Issue />
        <Issue />
        <Issue />
        <Issue />
        <Issue />
        <Issue />
        <Issue />
        
      </div>

    </div>
    
  )
}
