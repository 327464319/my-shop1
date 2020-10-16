const removePath = () => {
  if (window.sessionStorage.getItem('path')) {
    window.location.reload()

    window.sessionStorage.removeItem('path')
  }
}
export default { removePath }
