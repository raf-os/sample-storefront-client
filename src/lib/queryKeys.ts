export const QueryKeys = {
  User: {
    CartSize: ['User.CartSize'],
    CartPreview: ['User.CartPreview'],
    InboxPreviewSize: ['User.InboxPreview', 'User.InboxPreviewSize'],
    InboxPreview: ['User.InboxPreview'],
    InboxSize: ['User.InboxSize'],
    UserSearch: (name?: string) => {
      if (name !== undefined) {
        return ['User.NameSearch', name]
      } else {
        return ['InvalidQuery']
      }
    }
  }
}
