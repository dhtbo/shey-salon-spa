import PageTitle from "@/components/ui/page-title";
import React from "react";
import SalonSpaForm from "../../_components/salon-spa-form";
import { getSalonSpaById } from "@/actions/salon-spas";
import ErrorMessage from "@/components/ui/error-message";
import Loading from "./loading";

interface Props {
  params: { id: number };
}

async function EditSalonSpa({ params }: Props) {
  const { id } = await params;

  const resonse: any = await getSalonSpaById(id!);
  if (!resonse.success) {
    return <ErrorMessage error={resonse.message} />;
  }

  return (
    <div>
      <PageTitle title="Edit Salon Spa" />
      <SalonSpaForm formType="edit" initialValues={resonse.data} />
    </div>
  );
}

export default EditSalonSpa;
