
const toSec = exports.toSec = t => Math.round(t/1000)
const equal = exports.equal = (f, s, sp) => {
	if (f === s) return true;
	const l = Math.abs(s - f);
	return (l <= sp);
}

exports.sleep = s => new Promise(resolve => setTimeout(resolve, s))

const TimePoint = exports.TimePoint = function() {
	this.point = Date.now();
	this.pointSec = toSec(this.point)
}

TimePoint.prototype.timeSec = function() {
	return toSec(Date.now())
}

TimePoint.prototype.equal = function(np, spread =0) {
	return equal(this.pointSec, np, spread)
}

TimePoint.prototype.equalLess = function(np, spread=0) {
	return this.equal(this.timeSec() - np, spread)
}
TimePoint.prototype.equalMore = function(np, spread=0) {
	return this.equal(this.timeSec() + np, spread)
}

