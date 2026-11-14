import { useEffect, useRef, useState } from "react";
import { Icon } from "../desktop/Icon";
import { WindowControls } from "../desktop/WindowControls";
import { drawProject, projects, type Project } from "./project-artwork";

export function ProjectPicker({ onOpen, onClose }: { onOpen: (project: Project) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Project>(projects[0]);
  const [search, setSearch] = useState("");
  const [previews, setPreviews] = useState<Record<string, string>>({});
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 540;
    const ctx = canvas.getContext("2d");
    if (ctx) setPreviews(Object.fromEntries(projects.map(project => {
      drawProject(ctx, project);
      return [project.id, canvas.toDataURL("image/png")];
    })));
    return () => previous?.focus({ preventScroll: true });
  }, []);
  const visible = projects.filter(project => project.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <dialog ref={dialog} className="aero-window project-picker" aria-label="Open a project" onCancel={onClose}>
      <header className="title-bar"><Icon name="paint" size={17} /><span>Open</span><WindowControls onClose={onClose} /></header>
      <form onSubmit={event => { event.preventDefault(); if (visible.includes(selected)) onOpen(selected); }}>
        <div className="picker-location"><span aria-hidden="true">←</span><div><Icon name="folder" size={18} /> Louka <span aria-hidden="true">›</span> Projects</div>
          <input aria-label="Search projects" placeholder="Search Projects" value={search} onChange={event => {
            const value = event.target.value;
            setSearch(value);
            const match = projects.find(project => project.name.toLowerCase().includes(value.toLowerCase()));
            if (match) setSelected(match);
          }} />
        </div>
        <div className="picker-toolbar">Open a project image in Paint <span>PNG images</span></div>
        <div className="picker-body">
          <aside><strong>Favorites</strong><span><Icon name="folder" size={18} /> Projects</span><small>Louka’s portfolio</small></aside>
          <div className="picker-files" role="radiogroup" aria-label="Project images">
            {visible.map(project => <label key={project.id} className={`picker-file ${selected.id === project.id ? "is-selected" : ""}`} onDoubleClick={() => onOpen(project)}>
              <input type="radio" name="project" value={project.id} checked={selected.id === project.id} onChange={() => setSelected(project)} autoFocus={project.id === projects[0].id} />
              {previews[project.id] && <img src={previews[project.id]} alt="" />}
              <span>{project.file}</span>
            </label>)}
            {!visible.length && <p className="picker-empty">No projects match your search.</p>}
          </div>
        </div>
        <footer className="picker-footer">
          <label>File name:<input aria-label="File name" value={visible.includes(selected) ? selected.file : ""} readOnly /></label>
          <div><span>PNG image (*.png)</span><button className="classic-button" type="submit" disabled={!visible.includes(selected)}>Open</button><button className="classic-button" type="button" onClick={onClose}>Cancel</button></div>
        </footer>
      </form>
    </dialog>
  );
}
