"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X } from "lucide-react";

interface Plan {
  _id: string;
  name: string;
  price: number;
  features: any[];
}

interface PlanComparisonProps {
  plans: Plan[];
  currentPlanId?: string | null;
}

export function PlanComparison({ plans, currentPlanId }: PlanComparisonProps) {
  const allFeatures = plans.reduce((acc: any[], plan) => {
    plan.features.forEach((feature) => {
      if (!acc.some((f) => f.id === feature.id)) {
        acc.push(feature);
      }
    });
    return acc;
  }, []);

  allFeatures.sort((a, b) => {
    if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
      return a.displayOrder - b.displayOrder;
    }
    return 0;
  });

  const getFeatureValue = (plan: Plan, featureId: string) => {
    const feature = plan.features.find((f) => f.id === featureId);
    if (!feature) return null;

    if (typeof feature.value === "boolean") {
      return feature.value ? (
        <Check className="h-4 w-4 text-green-500 mx-auto" />
      ) : (
        <X className="h-4 w-4 text-red-500 mx-auto" />
      );
    }

    return feature.value;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Feature</TableHead>
            {plans.map((plan) => (
              <TableHead key={plan._id} className="text-center">
                {plan.name}
                {currentPlanId === plan._id && (
                  <span className="ml-2 text-xs text-green-600">(Current)</span>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Price</TableCell>
            {plans.map((plan) => (
              <TableCell key={plan._id} className="text-center">
                ${plan.price}
              </TableCell>
            ))}
          </TableRow>
          {allFeatures.map((feature) => (
            <TableRow key={feature.id}>
              <TableCell className="font-medium">{feature.name}</TableCell>
              {plans.map((plan) => (
                <TableCell key={plan._id} className="text-center">
                  {getFeatureValue(plan, feature.id)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
