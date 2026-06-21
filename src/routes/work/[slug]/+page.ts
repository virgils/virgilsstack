import projects from "$lib/projects.json";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  const index = projects.findIndex((p) => p.slug === params.slug);

  if (index === -1) error(404, "Project not found");

  const project = projects[index];
  const nextProject = projects[(index + 1) % projects.length];

  return {
    project,
    nextProject: {
      client: nextProject.client,
      name: nextProject.project,
      slug: nextProject.slug,
    },
  };
};
