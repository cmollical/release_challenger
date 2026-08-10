import { ReleasePlan } from "../types";

export const emptyPlan: ReleasePlan = { name: "", objective: "", execution: "", scope: "", provenance: "", validation: "", rollout: "", recovery: "", dependencies: "", characteristics: [] };

export const riskyExampleRelease: ReleasePlan = {
  name: "Legacy Asset Management App Cleanup",
  objective: "Remove deprecated standalone asset-management application instances from customer sites following migration of the functionality into the core service-management platform.",
  execution: "Run the existing production deletion script against the supplied list of 883 production identifiers. The script calls an internal deletion API for each identifier.",
  scope: "883 production objects associated with customers who previously used the standalone asset-management application.",
  provenance: "The identifier list was supplied by the team coordinating the cleanup effort. The current batch was generated as part of the final production cleanup.",
  validation: "The deletion script has been peer reviewed and tested in staging. A previous production run against 30 identifiers completed successfully without reported customer impact.",
  rollout: "Execute the supplied population as a production batch using the existing deletion process.",
  recovery: "Affected customer data is backed up and can be restored if necessary.",
  dependencies: "Internal deletion API, customer data backup systems, and restoration tooling.",
  characteristics: ["Destructive", "Customer-facing", "Data-changing", "Potentially irreversible"],
};

export const readyExampleRelease: ReleasePlan = {
  name: "Support Portal Guidance Copy Update",
  objective: "Update explanatory text on the customer support portal to clarify how customers can view and respond to open support cases. No application behavior or workflow logic is changing.",
  execution: "Deploy updated static UI copy through the existing web application deployment process. The change modifies text content in one support portal component. No APIs, database schemas, permissions, routing logic, or backend services are changing.",
  scope: "One customer-facing support portal component used by authenticated customers. The change affects displayed explanatory text only.",
  provenance: "The final copy was approved by Support Operations and Product and is stored in the reviewed pull request associated with this release.",
  validation: "The change passed automated tests and the production build. The updated component was reviewed in the staging environment by Product and Support Operations. QA confirmed the correct copy renders on desktop and mobile and that existing links and interactions remain functional.",
  rollout: "Deploy through the standard production pipeline. The component is protected by an existing feature flag. Enable for internal accounts first, verify rendering and page functionality, then enable globally after a 15-minute observation period.",
  recovery: "Disable the feature flag to immediately restore the existing production copy. If necessary, revert the release through the standard deployment pipeline. No customer data is modified by the change.",
  dependencies: "Existing support portal frontend, feature-flag service, and standard deployment pipeline.",
  characteristics: ["Customer-facing"],
};
