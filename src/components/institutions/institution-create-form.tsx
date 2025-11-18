"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  createInstitutionAction,
  type CreateInstitutionState,
} from "@/server/actions/institution-actions";
import { InstitutionCategory } from "@/generated/prisma/enums";

const initialState: CreateInstitutionState = { status: "idle" };

export function InstitutionCreateForm() {
  const [state, formAction] = useActionState<CreateInstitutionState, FormData>(
    createInstitutionAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <Card className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Institution name</Label>
            <Input id="name" name="name" placeholder="Islington Central Library" required />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" type="url" placeholder="https://" />
          </div>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select id="category" name="category" defaultValue={InstitutionCategory.OTHER}>
            {Object.values(InstitutionCategory).map((item) => (
              <option key={item} value={item}>
                {item.replace("_", " ")}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            required
            placeholder="Tell parents what the organisation offers, schedule highlights, or any important info."
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="addressLine1">Address line 1</Label>
            <Input id="addressLine1" name="addressLine1" placeholder="2 Fieldway Crescent" required />
          </div>
          <div>
            <Label htmlFor="addressLine2">Address line 2</Label>
            <Input id="addressLine2" name="addressLine2" placeholder="Suite / Floor (optional)" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue="London" required />
          </div>
          <div>
            <Label htmlFor="borough">Borough</Label>
            <Input id="borough" name="borough" placeholder="Islington" required />
          </div>
          <div>
            <Label htmlFor="postcode">Postcode</Label>
            <Input id="postcode" name="postcode" placeholder="N1 2XH" required />
          </div>
        </div>
        {state.status === "error" && state.message && (
          <p className="text-sm text-red-500">{state.message}</p>
        )}
        {state.status === "success" && state.message && (
          <p className="text-sm text-emerald-600">{state.message}</p>
        )}
        <Button type="submit" size="lg">
          Submit institution
        </Button>
      </Card>
    </form>
  );
}
