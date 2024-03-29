class BufferVideo {
	startBuffer(url, callback) {
		url = new URL(url).href

		if (url === this.url) return
		this.url = url
		// chunk size, it continuously download 3mb chunks of the video. Till the end of it.
		this.chunk = 3000000
		// video data
		this.buffer = new ArrayBuffer()
		// current range
		this.range = 0
		// size of video
		this.size = 0
		// is it done?
		this.done = false
		// % buffered
		this.buffered = 0
		// in Mb
		this.speed = 0
		// time tracking
		this.now = Date.now()
		// elapsed time
		this.elapsed = 0
		// remainint time
		this.remaining = 0

		// communication
		this.channel = new BroadcastChannel('service-worker-video-buffering')
		this.channel.addEventListener('message', this.onMessage.bind(this))

		// start download
		this.download(this.url, callback)
	}
	onMessage(event) {
		let data = event.data
		// if the range can be satisfied
		if (data.url === this.url && this.size && this.buffer.byteLength - 1 > data.range) {
			this.channel.postMessage({
				range: data.range,
				buffer: this.buffer.slice(data.range).slice(0, this.chunk),
				size: this.size,
			})
		} else if (data.url === this.url) {
			this.channel.postMessage({
				range: data.range,
				buffer: 0,
				size: 0,
			})
		}
	}
	download(url, callback) {
		// if the buffer was cancelled return
		if (url != this.url) return

		// range
		let start = this.range
		let end = this.range + this.chunk - 1

		// do not overflow the range
		if (this.size > 0 && end > this.size) {
			end = this.size
		}

		// fetch
		// console.log('fetch bytes=' + start + '-' + end)
		let headers = {
			'content-type': 'multipart/byteranges',
			'range': 'bytes=' + start + '-' + end,
			'x-made-by': 'https://github.com/titoBouzout/ServiceWorkerVideoFullBuffer',
			// sometimes ranged requests are cached and they return more than we expect
			// they could return the whole thing, so better to use no cache
			// to return just what we want and no stress the network
			'pragma': 'no-cache',
			'cache-control': 'no-cache',
		}
		fetch(url, {
			headers: headers,
		})
			.then(async response => {
				// if the buffer was cancelled return
				if (url != this.url) return

				// are we done?
				let length = +response.headers.get('Content-Length')
				if (length < this.chunk) {
					this.done = true
				} else if (length > this.chunk) {
					throw new Error(
						'ranged request returned more than we expected, trying again using "no-cache"',
					)
				}

				this.size = +response.headers.get('Content-Type').split('/')[1]
				
				const buffer = await response.arrayBuffer();
				// if the buffer was cancelled return
				if (url != this.url) return

				// save the data
				this.buffer = this.concatBuffers(this.buffer, buffer)

				// increase range
				this.range += this.chunk

				// to update the browser with data
				this.buffered = this.buffer.byteLength / (this.size / 100)

				this.elapsed = (Date.now() - this.now) / 1000

				this.speed = (this.buffer.byteLength / 1024 / 1024 / this.elapsed).toFixed(1)

				this.remaining = (this.elapsed / this.buffered) * (100 - this.buffered)

				// callback to update the browser
				try {
					callback && callback(this)
				} catch (e) {
					console.error(e)
				}

				// keep downloading or exit
				if (this.done) {
					console.log('done!', end, this.size)
				} else {
					// console.log(this.buffered, end, this.size)
					this.download(url, callback)
				}
			})
			.catch(e => {
				// if the buffer was cancelled return
				if (url != this.url) return
				console.error(e)

				// on error keep trying
				setTimeout(() => this.download(url, callback), 1000)
			})
	}
	concatBuffers(buffer1, buffer2) {
		let b = new Uint8Array(buffer1.byteLength + buffer2.byteLength)
		b.set(new Uint8Array(buffer1), 0)
		b.set(new Uint8Array(buffer2), buffer1.byteLength)
		return b.buffer
	}
}
