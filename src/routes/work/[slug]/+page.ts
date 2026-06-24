import projects from "$lib/projects.json";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  const index = projects.findIndex((p) => p.slug === params.slug);

  if (index === -1) error(404, "Project not found");

  const project = projects[index];

  // Find the next project, skipping any that are `blocked` (no public page to link to).
  let nextProject = null;
  for (let step = 1; step < projects.length; step++) {
    const candidate = projects[(index + step) % projects.length];
    if (!(candidate as any).blocked) {
      nextProject = candidate;
      break;
    }
  }

  return {
    project,
    nextProject: nextProject
      ? {
          client: nextProject.client,
          name: nextProject.project,
          slug: nextProject.slug,
        }
      : null,
  };
};
