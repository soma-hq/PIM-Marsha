function titleCase(text) {
	// Convert the input to a string
	return String(text)
		.trim()
		.split(/\s+/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

module.exports = { titleCase };
