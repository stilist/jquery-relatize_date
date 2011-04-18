// Return the distance of time in words between two `Date`s, e.g.
// "5 days ago", "менее минуты назад".
//
// Options:
//   `end`: `Date`
//   `includeTime`: `Boolean`; used if date is in the past 2-5 days
//   `translation`: `Object`; relatizeDate translation
if (!Date.prototype.distanceOfTimeInWords) {
	Date.prototype.distanceOfTimeInWords =
			function (end, includeTime, translation) {
		var start = this,
				minute = 60,
				hour = minute * 60,
				day = hour * 24,
				n_days = 0,
				n_hours = 0,
				delta = 0,
				date = "",
				time = "",
				format = "";

		if (Date !== start.constructor || Date !== end.constructor) {
			throw new TypeError();
		} else {
			delta = parseInt(((end.getTime() - start.getTime()) / 1000), 10);

			// Less Than a Minute
			if (minute > delta) {
				date = translation.ltm;
			// ABout n Minutes (1-2 minutes)
			} else if ((minute * 2) > delta) {
				date = translation.abm;
			// 2-45 Minutes
			} else if ((45 * minute) > delta) {
				date = translation.m.replace("%d",
						parseInt((delta / minute), 10));
			// 1 Hour
			} else if ((hour * 2) > delta) {
				date = translation.h;
			// ABout n Hours (2-23 hours)
			} else if ((24 * hour) > delta) {
				date = translation.abh.replace("%d", parseInt((delta / hour), 10));
			// 1-2 days
			} else if ((48 * hour) > delta) {
				// 12-hour clock
				if (12 === translation.default_time_fmt) {
					n_hours = start.getHours() % 12;

					time = (0 === n_hours ? 12 : n_hours) + ":" +
							start.getMinutes().pad("0", 2) + " " +
							(start.getHours() > 12 ? "PM" : "AM");
				// 24-hour clock
				} else {
					time = start.getHours() + ":" + start.getMinutes();
				}

				// yesterDay At
				date = translation.d + " " + translation.at + " " + time;
			} else {
				n_days = parseInt((delta / day), 10).toString(10); // base 10

				// 5+ days
				if (5 < n_days) {
					format = "%B %d, %Y";

					if (includeTime) {
						format += " " + translation.at + " %I:%M %p";
					}

					date = start.strftime(format, translation);
				// 2-5 days
				} else {
					if ("undefined" !== typeof translation.shortds
							&& "undefined" !== typeof translation.shortds[n_days - 2]) {
						date = translation.shortds[n_days - 2];
					} else {
						date = translation.ds.replace("%d", n_days);
					}
				}
			}

			return date;
		}
	};
}

if (!Date.prototype.isValid) {
	Date.prototype.isValid = function() {
		if (Date !== this.constructor) {
			throw new TypeError();
		} else {
			return !isNaN(this) && 0 < this;
		}
	};
}

if (!Date.prototype.strftime) {
	Date.prototype.strftime = function (format, translation) {
		var date = this,
				day = date.getDay(),
				month = date.getMonth(),
				hours = date.getHours(),
				minutes = date.getMinutes();

		if (date.isValid()) {
			// note: destructively modifies `format`
			return format.replace(/\%([aAbBcdeHImMpSwyY])/g, function (key) {
				switch(key[1]) {
					// l10n abbreviated day name
					case "a": return translation.shortDays[day];
					// l10n full day name
					case "A": return translation.days[day];
					// l10n abbreviated month name
					case "b": return translation.shortMonths[month];
					// l10n full month name
					case "B": return translation.months[month];
					// l10n datetime
					case "c": return date.toString();
					// day of month, 01-31 (leading zero)
					case "d": return date.getDate().pad("0", 2);
					// day of month,  1-31 (leading space)
					case "e": return date.getDate().pad(" ", 2);
					// l10n abbreviated month name
					case "h": return translation.shortMonths[month];
					// 24-hour, 00-23
					case "H": return hours.pad("0", 2);
					// 12-hour, 01-12
					case "I":
						if (0 === (hours + 12) % 12) {
							return 12;
						} else {
							return (hours + 12) % 12;
						}
					// month, 01-12
					case "m": return (month + 1).pad("0", 2);
					// minutes, 00-59
					case "M": return minutes.pad("0", 2);
					// l10n "am"/"pm"
					case "p": return hours > 12 ? "PM" : "AM";
					// seconds, 00-60
					case "S": return date.getSeconds().pad("0", 2);
					// day of week, 0-6
					case "w": return day;
					// last two digits of year, 00-99
					case "y": return (date.getFullYear() % 100).pad("0", 2);
					// year
					case "Y": return date.getFullYear().toString();
				}
			});
		} else {
			// xxx not sure what the appropriate return value is here (/jordan)
			return date;
		}
	};
}

// Convenience method for calling `distanceOfTimeInWords` relative to the
// current timestamp.
//
// Options:
//   `includeTime`: `Boolean`; used if date is in the past 2-5 days
//   `translation`: `Object`; relatizeDate translation
if (!Date.prototype.timeAgoInWords) {
	Date.prototype.timeAgoInWords = function (includeTime, translation) {
		if (Date !== this.constructor) {
			throw new TypeError();
		} else if (this.isValid()) {
			return this.distanceOfTimeInWords(new Date(), includeTime, translation);
		}
	};
}

if (!Date.prototype.unixTimestamp) {
	Date.prototype.unixTimestamp = function () {
		if (Date !== this.constructor) {
			throw new TypeError();
		} else {
			return Math.round(this.getTime() / 1000);
		}
	}
}
