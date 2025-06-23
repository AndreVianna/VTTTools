SceneBuilder.initialize();
(window as any).SceneBuilder = SceneBuilder;
(window as any).closeModal = (modalType: string) => SceneBuilder.closeModal(modalType);
(window as any).setup = (id: string, setup: ILayersSetup) => SceneBuilder.setup(id, setup);
(window as any).render = (data?: ILayersSetup) => SceneBuilder.render(data);
(window as any).setCursor = (element: HTMLElement, cursor: string) => DomUtilities.setCursor(element, cursor);
(window as any).setContainerScroll = (container: HTMLElement, scroll: IPoint) => DomUtilities.setContainerScroll(container, scroll);
