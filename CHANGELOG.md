# Changelog

<br>

<!-- CHANGELOG-BODY-START -->
## [0.1.3](https://github.com/ptphongkmf/take-a-note/compare/v0.1.2...v0.1.3) (2026-09-06) <!-- timezone: Asia/Ho_Chi_Minh -->

### Features

- add `Temporal` polyfill ([4dad35d](https://github.com/ptphongkmf/take-a-note/commit/4dad35dbb1b16ce651968357d6384aff7d0fcca8))
- **app/router:** overhaul routing strategy for new notes ([960b2ed](https://github.com/ptphongkmf/take-a-note/commit/960b2ed9345fdb038991a4f5a011f62757d56e86))
- **editor:** add custom active block indicator plugin ([22553d9](https://github.com/ptphongkmf/take-a-note/commit/22553d96de035822f61e366afbf81be756dfed9f))
- **entities/note/ui:** finish add all icons for `NoteFormatIcon` ([7bd87a9](https://github.com/ptphongkmf/take-a-note/commit/7bd87a9fbcdc049ffe5eca395748a776051ff1d2))
- **features/delete-note:** add navigate to adjacent note on delete success ([146255d](https://github.com/ptphongkmf/take-a-note/commit/146255df3c502382b3dc660f35d363e13f6f570a))
- **features/save-note:** add smooth saving state for save status ui ([4bd8871](https://github.com/ptphongkmf/take-a-note/commit/4bd88717ab96f6069548f9d1e553eeb372fb7d6a))
- **home:** improve note editor layout and add note format select ([f9ca85d](https://github.com/ptphongkmf/take-a-note/commit/f9ca85dfcc71e402821fc73d3fb9cdda869d6ed3))
- **note:** add save and autosave ([9ab07f4](https://github.com/ptphongkmf/take-a-note/commit/9ab07f48ae459031b30263e27945cf7fc8c4113b))
- **pages/home:** add delete logic to delete button in `NoteAction` ([48775e2](https://github.com/ptphongkmf/take-a-note/commit/48775e21289c2671c9f09d74d0844316b96250dc))
- **pages/home:** add delete note to `NoteList` ([5c6061b](https://github.com/ptphongkmf/take-a-note/commit/5c6061b9fc74ce853047b21f26aefb7143004aa7))
- **pages/home:** add note list sidebar basic display ([0f54d6b](https://github.com/ptphongkmf/take-a-note/commit/0f54d6bbf6059349b60872bef782a00514190d72))
- **pages/home:** add responsive mobile sheets for sidebars ([91cb5e4](https://github.com/ptphongkmf/take-a-note/commit/91cb5e45e82254987d5b553c3302b5624356ab31))
- **pages/home:** add styles and re-order note action buttons ([7c65b93](https://github.com/ptphongkmf/take-a-note/commit/7c65b936c0d9baef64619fb4b55ca1bd9b94ac94))
- **pages/home:** add working "New note" button ([e0a2a71](https://github.com/ptphongkmf/take-a-note/commit/e0a2a71365e1e072ef4e02f811d792ad7796f3a5))
- **pages/home:** make note action buttons more snappy ([aefcec4](https://github.com/ptphongkmf/take-a-note/commit/aefcec4fe00c9ba624ff3ebd688194ddd36b3b05))
- **pages/home:** reintroduce mobile `NoteList` and `NoteAction` sheets ([105601f](https://github.com/ptphongkmf/take-a-note/commit/105601f86f4056d89b155672e5fa03e3dbb0888c))
- **shared/api:** add note garbage collector ([1786121](https://github.com/ptphongkmf/take-a-note/commit/17861212904f75afe1bca13d84f72dc6fad55769))
- **shared/api:** add sort filter options to `listNotes` ([501cdae](https://github.com/ptphongkmf/take-a-note/commit/501cdae6105caa37652c55cf6d19478931b2cf17))
- **shared/api:** auto invalidate all queries on mutation success ([ff2dd9c](https://github.com/ptphongkmf/take-a-note/commit/ff2dd9c913c1d0fef512d7f968e8f8a90b7dd240))
- **shared/api:** return data with `isCorrupt` true instead of throwing on validation failure ([c94e198](https://github.com/ptphongkmf/take-a-note/commit/c94e198f4870d4a347e0754a28ad588b329dd248))
- **shared/ui:** add `async-boundry.tsx` ([4311a72](https://github.com/ptphongkmf/take-a-note/commit/4311a7227efd727e1e7e6ced8f64d3372285d3e3))
- **shared/ui:** add `ErrorPanel` component ([bd19ae4](https://github.com/ptphongkmf/take-a-note/commit/bd19ae4bdf02c3c27ceaeeaee2afb2ef6839ac47))
- **shared/ui:** add optional auto invalidate queries on error reset ([c793ea6](https://github.com/ptphongkmf/take-a-note/commit/c793ea673061fb69f8102561868af1b2bd2a0e89))

### Bug Fixes

- **app/router:** give correct `queryOptions` to `prefetch` and `fetch` in route loader ([241dd34](https://github.com/ptphongkmf/take-a-note/commit/241dd34f12d38084fb8e5af5ab6a3ff63ffc139e))
- **entities/note:** fix flickering "unsaved" status on page refresh ([f9c7c43](https://github.com/ptphongkmf/take-a-note/commit/f9c7c4346a475a96e3e70ae475c70cb90520439f))
- **features/save-note:** cancel pending save when note reverts to clean state ([d2d0e2a](https://github.com/ptphongkmf/take-a-note/commit/d2d0e2a69f1aa0f6a11a048d8995eae4fb30d1e0))
- **features/switch-note-format:** change format text case to "Title Case" ([378e37c](https://github.com/ptphongkmf/take-a-note/commit/378e37c4f1ae5577ef1baf093ecd197200d9d8f5))
- **lexical:** update lexical schema to use correct `SerializedEditorState` type ([2cebd50](https://github.com/ptphongkmf/take-a-note/commit/2cebd50eef88ef0a16e88ca3b6bb1d304ea6b46f))
- **pages/home:** add `w-fit` to delete button and align right to time text ([7a88ef9](https://github.com/ptphongkmf/take-a-note/commit/7a88ef9fa6d5754a1aee29a53cfcea1e435b063c))

### Performance Improvements

- **editor:** move lexical state back to external signal and add custom debounced dirty check ([e944c94](https://github.com/ptphongkmf/take-a-note/commit/e944c94d8806902c2d97389f324491875384340c))
- **shared/api:** optimize `gcNote` to clean up orphaned note content ([076e65f](https://github.com/ptphongkmf/take-a-note/commit/076e65fe4688db2b853baead6c7f5d583bba1e49))
- **shared/lib:** change `for of` loop to `Object.keys()` ([4d0e305](https://github.com/ptphongkmf/take-a-note/commit/4d0e305d3824409afa2c47952b69346ba697b14e))

## [0.1.2](https://github.com/ptphongkmf/take-a-note/compare/v0.1.1...v0.1.2) (2026-05-04) <!-- timezone: Asia/Ho_Chi_Minh -->

### Features

- **editor:** add draggable block plugin ([d3c9eec](https://github.com/ptphongkmf/take-a-note/commit/d3c9eec49865c56d28d273b58f38ca24f2873580))
- **home:** replace textarea with a simple lexical plain text editor ([d242ac2](https://github.com/ptphongkmf/take-a-note/commit/d242ac2e54c9c9391ac9d9a2d2c55c8bb82ae2c9))
- **idb:** add idb init ([72cd040](https://github.com/ptphongkmf/take-a-note/commit/72cd0409ea30d11fbe8b4904f1ae965b4b738104))
- **routes:** add /notes/$id ([05352a6](https://github.com/ptphongkmf/take-a-note/commit/05352a66399cc00bdd7320f798f0946ca2066daf))

## [0.1.1](https://github.com/ptphongkmf/take-a-note/compare/v0.1.0...v0.1.1) (2026-04-28) <!-- timezone: Asia/Ho_Chi_Minh -->

### Features

- **home:** add simple first home page ([2120869](https://github.com/ptphongkmf/take-a-note/commit/2120869f30f06d31bffcf17212f76a48d7bb85e0))
- **home:** fine-tune note taking layout ([9a90025](https://github.com/ptphongkmf/take-a-note/commit/9a90025eb586b7bd694d726d369515f865e8477f))
- **idb:** add idb storage ([1671cb0](https://github.com/ptphongkmf/take-a-note/commit/1671cb010af39301182f42834cade370f8a1c424))

### Bug Fixes

- **typography:** fine-tune fluid text clamp values ([1cc5965](https://github.com/ptphongkmf/take-a-note/commit/1cc596522a5c03341e8c194de9c17ad3f8031159))

## [0.1.0](v0.1.0) (2026-04-21) <!-- timezone: Asia/Ho_Chi_Minh -->

### Features

- **app:** init ([a5b607d](https://github.com/ptphongkmf/take-a-note/commit/a5b607db3f508624955ba81ff111bfca7f585323))
<!-- CHANGELOG-BODY-END -->