import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const logo = PlaceHolderImages.find((img) => img.id === "logo");

export function SettingsForm() {
  return (
    <form className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="bank-details">Bank Details</Label>
        <Textarea
          id="bank-details"
          placeholder="Enter your bank account number, routing number, etc."
          rows={4}
        />
        <p className="text-sm text-muted-foreground">
          This information will be displayed on your invoices.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Company Logo</Label>
        <div className="flex items-center gap-4">
          {logo && (
            <Image
              src={logo.imageUrl}
              width={64}
              height={64}
              alt="Current company logo"
              className="rounded-md border bg-muted"
              data-ai-hint={logo.imageHint}
            />
          )}
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload New Logo
          </Button>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit">Save Settings</Button>
      </div>
    </form>
  );
}
