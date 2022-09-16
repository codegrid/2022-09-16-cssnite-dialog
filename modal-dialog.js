// Licence: CC0 1.0 Public Domain.
// Auther: @yomotsu
( () => {

	// ポリフィル読み込み（CSS）
	const polyfillCss = document.createElement( 'link' );
	polyfillCss.setAttribute( 'rel', 'stylesheet' );
	polyfillCss.setAttribute( 'href', 'https://unpkg.com/dialog-polyfill@0.5.6/dist/dialog-polyfill.css' );
	document.head.appendChild( polyfillCss );

	// ポリフィル読み込み（JS）
	// （環境が整っているなら esm で読み込むことをおすすめします）
	const polyfillScript = document.createElement( 'script' );
	polyfillScript.addEventListener( 'load', () => {
		console.log(dialogPolyfill);
		document.querySelectorAll( 'dialog' ).forEach( ( $dialog ) => dialogPolyfill.registerDialog( $dialog ) )
	});
	polyfillScript.src = 'https://unpkg.com/dialog-polyfill@0.5.6/dist/dialog-polyfill.js';
	document.head.appendChild( polyfillScript );

	// スクロール抑止用ライブラリー読み込み
	// （環境が整っているなら esm で読み込むことをおすすめします）
	const noScrollScript = document.createElement( 'script' );
	noScrollScript.src = 'https://unpkg.com/no-scroll@2.1.1/index.js';
	document.head.appendChild( noScrollScript );

	// ↓↓↓ここから実際の機能↓↓↓

	// ::backdrop 部分がクリックされたときに実行される関数。
	// 実際は、::backdrop を含む <dialog> 要素のどこかをクリックしたとき、<dialog> を非表示にするけれど
	// 「モーダルの内容」がクリックされたときは無視する
	const onBackdropClick = ( event ) => {

		const $modal = event.target;
		const elRect = $modal.getBoundingClientRect();
		const isInDialog =
			elRect.top <= event.clientY && event.clientY <= elRect.bottom &&
			elRect.left <= event.clientX && event.clientX <= elRect.right;

		// もし、内側をクリックしていたら、なにもしない
		if ( isInDialog ) return;
		// それ以外（外側をクリック）なら閉じる
		closeModal( $modal.id );

	}

	// 完全に閉じきった後に実行される関数。開く前の状態にする
	const onClose = ( event ) => {

		const $modal = event.target;
		$modal.removeEventListener( 'click', onBackdropClick );
		$modal.removeEventListener( 'cancel', onClose );
		$modal.removeEventListener( 'close', onClose );
		$modal.classList.remove( '-opening' );
		noScroll.off(); // ページ本体のスクロール抑止解除

	}

	// モーダルを開きたいときに実行する関数。
	// 対象 <dialog> の id 名を受け取り、その <dialog> を表示する
	const showModal = ( id ) => {

		const $modal = document.getElementById( id );
		$modal.showModal();
		// showModal により display 値が切り替わった後、class 属性をつける
		requestAnimationFrame( () => $modal.classList.add( '-opening' ) );
		// noScroll.on(); // ページ本体のスクロールを抑止する

		// dialog を開くと、自動で dialog 内のボタンに自動フォーカスする。
		// dialog 下部にボタンがある場合、dialog 下部にスクロールした状態で開いてしまう。それを抑止。
		requestAnimationFrame( () => requestAnimationFrame( () => $modal.scrollTop = 0 ) );

		$modal.addEventListener( 'click', onBackdropClick );
		$modal.addEventListener( 'cancel', onClose );
		$modal.addEventListener( 'close', onClose );

	}

	// モーダルを閉じたいときに実行する関数。
	// 対象 <dialog> の id 名を受け取り、CSS Transition 終了後に <dialog> を非表示する
	const closeModal = ( id ) => {

		const $modal = document.getElementById( id );
		$modal.classList.remove( '-opening' );
		$modal.addEventListener( 'transitionend', $modal.close, { once: true } )

	}

	// 開く関数と、閉じる関数を windows 直下に露出させる。
	// （環境が整っているなら esm として export するのをおすすめします）
	window.showModal = showModal;
	window.closeModal = closeModal;

} )();

