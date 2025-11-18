import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export function EventFilters() {
  return (
    <Card className="space-y-4">
      <div>
        <Label htmlFor="keyword">Keyword or postcode</Label>
        <Input
          id="keyword"
          placeholder="e.g. N1 2XH or Storytime"
          autoComplete="postal-code"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="category">Audience</Label>
          <Select id="category" defaultValue="all">
            <option value="all">All ages</option>
            <option value="children">0-5 years</option>
            <option value="family">Family</option>
            <option value="learning">Teens & young people</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="cost">Cost</Label>
          <Select id="cost" defaultValue="free">
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" defaultValue="all">
            <option value="all">Official + community</option>
            <option value="official">Official only</option>
            <option value="community">Community</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" />
        </div>
      </div>
    </Card>
  );
}
