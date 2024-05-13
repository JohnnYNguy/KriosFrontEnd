const mapStyleHandler = ( handleModal: (message: string, isOpen: boolean) => void = () => {} ) => {
    handleModal("Du må skjule alle værstasjoner for du bytter kartsil.", true);
}

export default mapStyleHandler;